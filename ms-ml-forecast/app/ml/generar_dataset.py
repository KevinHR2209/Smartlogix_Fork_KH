"""
Genera un dataset sintetico de ventas diarias de 1 anio (365 dias) para las
20 fragancias del catalogo, con:
  - estacionalidad segun la temporada asignada en el catalogo
  - eventos puntuales (Navidad, Dia de la Madre, Cyber Monday, San Valentin)
  - ruido aleatorio realista
  - quiebres de stock provocados a proposito en algunos SKU/periodos, para
    que el modelo de clasificacion tenga ejemplos positivos que aprender

Este dataset es una simulacion basada en reglas de negocio conocidas, NO
son ventas reales. Sirve como prueba de concepto de la arquitectura y del
pipeline de entrenamiento, no como fuente de verdad de demanda real.
"""
import json
import os
import random
from datetime import date, timedelta

random.seed(42)

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

EVENTOS = {
    # mes, dia -> (nombre, multiplicador de demanda, ventana de dias antes/despues)
    (2, 14): ("san_valentin", 2.2, 4),
    (5, 11): ("dia_de_la_madre", 2.6, 5),
    (11, 28): ("cyber_monday", 3.0, 2),
    (12, 24): ("navidad", 2.8, 8),
}

TEMPORADA_POR_MES = {
    12: "verano", 1: "verano", 2: "verano",
    3: "entretiempo", 4: "entretiempo", 5: "entretiempo",
    6: "invierno", 7: "invierno", 8: "invierno",
    9: "entretiempo", 10: "entretiempo", 11: "entretiempo",
}


def cargar_catalogo():
    with open(os.path.join(BASE_DIR, "catalogo_perfumes.json"), encoding="utf-8") as f:
        return json.load(f)


def factor_temporada(producto, mes):
    temporada_mes = TEMPORADA_POR_MES[mes]
    if temporada_mes in producto["temporada"]:
        return 1.4
    if "entretiempo" in producto["temporada"] and temporada_mes == "entretiempo":
        return 1.2
    return 0.75


def factor_evento(fecha):
    for (m, d), (nombre, mult, ventana) in EVENTOS.items():
        try:
            fecha_evento = date(fecha.year, m, d)
        except ValueError:
            continue
        delta = abs((fecha - fecha_evento).days)
        if delta <= ventana:
            atenuacion = 1 - (delta / (ventana + 1)) * 0.5
            return 1 + (mult - 1) * atenuacion
    return 1.0


def generar_ventas(dias=365, stock_inicial=120):
    catalogo = cargar_catalogo()
    # el dataset termina hoy y retrocede 365 dias, para que los filtros del
    # dashboard (semana, mes actual, mes anterior, anio) siempre tengan datos
    # sin importar cuando se ejecute este generador
    fecha_inicio = date.today() - timedelta(days=dias - 1)

    ventas = []
    stock_actual = {p["id_producto"]: stock_inicial for p in catalogo}
    quiebres = []

    # elegir ~25% de los productos para forzar riesgo de quiebre (proporcion
    # similar a la version de 20 SKUs, donde eran 6/20)
    productos_ids = [p["id_producto"] for p in catalogo]
    n_forzados = max(4, round(len(productos_ids) * 0.25))
    forzar_quiebre = random.sample(productos_ids, n_forzados)
    dia_inicio_quiebre = {
        pid: random.randint(60, 300) for pid in forzar_quiebre
    }

    for dia_offset in range(dias):
        fecha = fecha_inicio + timedelta(days=dia_offset)
        mes = fecha.month
        dia_semana = fecha.weekday()  # 0=lunes

        for producto in catalogo:
            pid = producto["id_producto"]
            precio = producto["precio_referencia"]

            base = 2.0 if precio < 90000 else 1.2
            f_temp = factor_temporada(producto, mes)
            f_evento = factor_evento(fecha)
            f_finde = 1.3 if dia_semana >= 5 else 1.0
            ruido = random.gauss(1.0, 0.25)

            demanda_esperada = max(0, base * f_temp * f_evento * f_finde * ruido)
            unidades_demandadas = max(0, round(random.gauss(demanda_esperada, demanda_esperada * 0.45)))

            # forzar quiebre: al iniciar la ventana el stock baja a un nivel de
            # RIESGO (no una garantia de quiebre) y la reposicion se vuelve
            # esporadica. Si la demanda real de esos dias es alta, quiebra;
            # si es baja, no. Esto obliga al modelo a aprender un patron de
            # riesgo probabilistico en vez de leer una regla determinista.
            en_ventana_quiebre = (
                pid in forzar_quiebre
                and dia_inicio_quiebre[pid] <= dia_offset <= dia_inicio_quiebre[pid] + 25
            )
            if pid in forzar_quiebre and dia_offset == dia_inicio_quiebre[pid]:
                stock_actual[pid] = random.randint(18, 40)
            if en_ventana_quiebre and random.random() < 0.20:
                stock_actual[pid] += random.randint(8, 18)

            stock_disponible = stock_actual[pid]
            unidades_vendidas = min(unidades_demandadas, stock_disponible)
            hubo_quiebre = unidades_demandadas > stock_disponible

            stock_actual[pid] = stock_disponible - unidades_vendidas

            # reposicion semanal, con probabilidad de saltarse una semana
            # (retraso de proveedor) para que el stock no siga un patron
            # perfectamente regular incluso fuera de la ventana forzada
            if dia_semana == 0 and not en_ventana_quiebre and random.random() > 0.15:
                reposicion = random.randint(12, 32)
                stock_actual[pid] += reposicion

            # quiebre "sorpresa": pico de demanda puntual que un producto con
            # stock normal no logra absorber, sin relacion con la ventana
            # forzada. Simula un evento viral/imprevisto en vez de una
            # tendencia visible de antemano.
            if pid not in forzar_quiebre and random.random() < 0.004:
                pico_extra = random.randint(15, 30)
                unidades_demandadas += pico_extra
                unidades_vendidas = min(unidades_demandadas, stock_actual[pid])
                hubo_quiebre = unidades_demandadas > stock_actual[pid]
                stock_actual[pid] = max(0, stock_actual[pid] - unidades_vendidas)

            ventas.append({
                "fecha": fecha.isoformat(),
                "id_producto": pid,
                "unidades_vendidas": int(unidades_vendidas),
                "unidades_demandadas": int(unidades_demandadas),
                "stock_inicio_dia": int(stock_disponible),
                "stock_fin_dia": int(stock_actual[pid]),
                "hubo_quiebre": bool(hubo_quiebre),
                "precio_unitario": precio,
            })

            if hubo_quiebre:
                quiebres.append({"fecha": fecha.isoformat(), "id_producto": pid})

    return ventas, quiebres


if __name__ == "__main__":
    ventas, quiebres = generar_ventas()
    os.makedirs(BASE_DIR, exist_ok=True)
    with open(os.path.join(BASE_DIR, "ventas_historicas.json"), "w", encoding="utf-8") as f:
        json.dump(ventas, f, ensure_ascii=False)
    print(f"Dataset generado: {len(ventas)} registros diarios ({len(ventas)//365} SKUs x 365 dias aprox)")
    print(f"Dias con quiebre de stock detectados: {len(quiebres)}")
