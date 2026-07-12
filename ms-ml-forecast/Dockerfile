FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Genera el catalogo base y el dataset sintetico de 1 anio dentro de la imagen,
# para que el servicio tenga datos utilizables desde el primer arranque
RUN python -m app.ml.generar_catalogo && python -m app.ml.generar_dataset

EXPOSE 8086

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8086"]
