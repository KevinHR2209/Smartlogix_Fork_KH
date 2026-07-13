"""
Genera el catalogo base de 80 fragancias con sus atributos olfativos,
formato, version y momento/temporada de uso recomendado.

Los id_producto son ficticios (9001-9080) y deben mapearse manualmente
a los id_producto reales de ms-inventario cuando se integren al catalogo
de productos real.
"""
import json
import os

CATALOGO = [
    # id, nombre, marca, genero, familia_olfativa (lista), formato, version,
    # presentacion_ml, temporada, momento_uso, precio_referencia
    (9001, "Sauvage", "Dior", "masculino", ["amaderada", "aromatica"], "EDT", "clasica", 100, ["verano", "entretiempo"], ["dia", "noche"], 89990),
    (9002, "Sauvage Elixir", "Dior", "masculino", ["amaderada", "especiada"], "Parfum", "elixir", 60, ["invierno"], ["noche"], 109990),
    (9003, "Bleu de Chanel", "Chanel", "masculino", ["amaderada", "citrica"], "EDP", "clasica", 100, ["entretiempo", "verano"], ["dia", "noche"], 99990),
    (9004, "Acqua di Gio", "Giorgio Armani", "masculino", ["acuatica", "citrica"], "EDT", "clasica", 100, ["verano"], ["dia"], 79990),
    (9005, "Acqua di Gio Profondo", "Giorgio Armani", "masculino", ["acuatica", "aromatica"], "EDP", "profondo", 75, ["verano"], ["dia", "noche"], 89990),
    (9006, "La Vie Est Belle", "Lancome", "femenino", ["gourmand", "floral"], "EDP", "clasica", 75, ["invierno", "entretiempo"], ["noche"], 94990),
    (9007, "Good Girl", "Carolina Herrera", "femenino", ["floral", "oriental"], "EDP", "clasica", 80, ["invierno"], ["noche"], 97990),
    (9008, "Good Girl Legere", "Carolina Herrera", "femenino", ["floral", "citrica"], "EDT", "legere", 80, ["verano", "entretiempo"], ["dia"], 92990),
    (9009, "Black Opium", "Yves Saint Laurent", "femenino", ["gourmand", "oriental"], "EDP", "clasica", 90, ["invierno"], ["noche"], 99990),
    (9010, "Libre", "Yves Saint Laurent", "femenino", ["floral", "aromatica"], "EDP", "clasica", 90, ["entretiempo"], ["dia", "noche"], 96990),
    (9011, "One Million", "Paco Rabanne", "masculino", ["especiada", "amaderada"], "EDT", "clasica", 100, ["invierno", "entretiempo"], ["noche"], 74990),
    (9012, "Invictus", "Paco Rabanne", "masculino", ["acuatica", "amaderada"], "EDT", "clasica", 100, ["verano"], ["dia"], 76990),
    (9013, "Light Blue", "Dolce & Gabbana", "femenino", ["citrica", "acuatica"], "EDT", "clasica", 100, ["verano"], ["dia"], 84990),
    (9014, "The Only One", "Dolce & Gabbana", "femenino", ["oriental", "floral"], "EDP", "clasica", 100, ["invierno"], ["noche"], 88990),
    (9015, "Eros", "Versace", "masculino", ["aromatica", "amaderada"], "EDT", "clasica", 100, ["verano", "entretiempo"], ["dia", "noche"], 79990),
    (9016, "Eros Parfum", "Versace", "masculino", ["amaderada", "especiada"], "Parfum", "parfum", 100, ["invierno"], ["noche"], 99990),
    (9017, "Si", "Giorgio Armani", "femenino", ["gourmand", "amaderada"], "EDP", "clasica", 100, ["entretiempo", "invierno"], ["noche"], 98990),
    (9018, "My Way", "Giorgio Armani", "femenino", ["floral", "gourmand"], "EDP", "clasica", 90, ["entretiempo"], ["dia", "noche"], 93990),
    (9019, "Aventus", "Creed", "masculino", ["frutal", "amaderada"], "EDP", "clasica", 100, ["entretiempo", "verano"], ["dia", "noche"], 189990),
    (9020, "CH Men", "Carolina Herrera", "masculino", ["citrica", "especiada"], "EDT", "clasica", 100, ["verano", "entretiempo"], ["dia"], 72990),

    (9021, "Terre d'Hermes", "Hermes", "masculino", ["amaderada", "citrica"], "EDT", "clasica", 100, ["verano", "entretiempo"], ["dia"], 95990),
    (9022, "Dior Homme Intense", "Dior", "masculino", ["amaderada", "floral"], "EDP", "intense", 100, ["invierno"], ["noche"], 105990),
    (9023, "Luna Rossa", "Prada", "masculino", ["aromatica", "citrica"], "EDT", "clasica", 100, ["verano"], ["dia"], 84990),
    (9024, "Boss Bottled", "Hugo Boss", "masculino", ["amaderada", "frutal"], "EDT", "clasica", 100, ["entretiempo"], ["dia", "noche"], 69990),
    (9025, "Boss Bottled Intense", "Hugo Boss", "masculino", ["especiada", "amaderada"], "EDP", "intense", 100, ["invierno"], ["noche"], 79990),
    (9026, "CK One", "Calvin Klein", "unisex", ["citrica", "acuatica"], "EDT", "clasica", 100, ["verano"], ["dia"], 54990),
    (9027, "CK Eternity", "Calvin Klein", "masculino", ["floral", "amaderada"], "EDT", "clasica", 100, ["entretiempo"], ["dia"], 59990),
    (9028, "Polo Blue", "Ralph Lauren", "masculino", ["acuatica", "citrica"], "EDT", "clasica", 100, ["verano"], ["dia"], 74990),
    (9029, "Polo Red", "Ralph Lauren", "masculino", ["frutal", "especiada"], "EDT", "clasica", 100, ["entretiempo"], ["noche"], 76990),
    (9030, "Oud Wood", "Tom Ford", "masculino", ["amaderada", "especiada"], "EDP", "clasica", 50, ["invierno"], ["noche"], 159990),
    (9031, "Noir Extreme", "Tom Ford", "masculino", ["especiada", "amaderada"], "EDP", "clasica", 100, ["invierno"], ["noche"], 149990),
    (9032, "Man in Black", "Bvlgari", "masculino", ["especiada", "amaderada"], "EDP", "clasica", 100, ["invierno"], ["noche"], 89990),
    (9033, "Aqva Pour Homme", "Bvlgari", "masculino", ["acuatica"], "EDT", "clasica", 100, ["verano"], ["dia"], 79990),
    (9034, "Le Male", "Jean Paul Gaultier", "masculino", ["aromatica", "oriental"], "EDT", "clasica", 125, ["entretiempo"], ["noche"], 89990),
    (9035, "Le Beau", "Jean Paul Gaultier", "masculino", ["amaderada", "frutal"], "EDT", "clasica", 100, ["verano"], ["dia"], 84990),
    (9036, "L'Eau d'Issey", "Issey Miyake", "masculino", ["acuatica", "aromatica"], "EDT", "clasica", 125, ["verano"], ["dia"], 74990),
    (9037, "Montblanc Legend", "Montblanc", "masculino", ["aromatica", "amaderada"], "EDT", "clasica", 100, ["entretiempo"], ["dia", "noche"], 64990),
    (9038, "Wanted", "Azzaro", "masculino", ["especiada", "amaderada"], "EDT", "clasica", 100, ["invierno"], ["noche"], 69990),
    (9039, "L.12.12 Blanc", "Lacoste", "masculino", ["citrica", "aromatica"], "EDT", "clasica", 100, ["verano"], ["dia"], 59990),
    (9040, "Uomo Born in Roma", "Valentino", "masculino", ["amaderada", "especiada"], "EDP", "clasica", 100, ["invierno"], ["noche"], 94990),
    (9041, "Guilty Pour Homme", "Gucci", "masculino", ["aromatica", "amaderada"], "EDT", "clasica", 90, ["entretiempo"], ["noche"], 84990),
    (9042, "Gentleman", "Givenchy", "masculino", ["amaderada", "especiada"], "EDP", "clasica", 100, ["invierno"], ["noche"], 87990),
    (9043, "Guerlain Homme", "Guerlain", "masculino", ["citrica", "amaderada"], "EDT", "clasica", 100, ["verano"], ["dia"], 79990),
    (9044, "Allure Homme Sport", "Chanel", "masculino", ["citrica", "acuatica"], "EDT", "clasica", 100, ["verano"], ["dia"], 99990),
    (9045, "Armani Code", "Giorgio Armani", "masculino", ["oriental", "amaderada"], "EDP", "clasica", 100, ["invierno"], ["noche"], 89990),
    (9046, "Versace Pour Homme", "Versace", "masculino", ["acuatica", "aromatica"], "EDT", "clasica", 100, ["verano"], ["dia"], 74990),
    (9047, "L'Homme", "Prada", "masculino", ["amaderada", "floral"], "EDT", "clasica", 100, ["entretiempo"], ["dia"], 84990),
    (9048, "Chanel No 5", "Chanel", "femenino", ["floral", "oriental"], "EDP", "clasica", 100, ["invierno"], ["noche"], 129990),
    (9049, "Coco Mademoiselle", "Chanel", "femenino", ["oriental", "floral"], "EDP", "clasica", 100, ["entretiempo"], ["noche"], 119990),
    (9050, "Chance Eau Tendre", "Chanel", "femenino", ["floral", "frutal"], "EDT", "clasica", 100, ["verano"], ["dia"], 109990),
    (9051, "J'adore", "Dior", "femenino", ["floral"], "EDP", "clasica", 100, ["entretiempo"], ["dia", "noche"], 114990),
    (9052, "Miss Dior", "Dior", "femenino", ["floral", "frutal"], "EDP", "clasica", 100, ["verano"], ["dia"], 104990),
    (9053, "Mon Paris", "Yves Saint Laurent", "femenino", ["gourmand", "floral"], "EDP", "clasica", 90, ["invierno"], ["noche"], 99990),
    (9054, "La Vie Est Belle Intensement", "Lancome", "femenino", ["gourmand", "floral"], "EDP", "intense", 50, ["invierno"], ["noche"], 89990),
    (9055, "Idole", "Lancome", "femenino", ["floral", "frutal"], "EDP", "clasica", 75, ["entretiempo"], ["dia"], 94990),
    (9056, "Si Passione", "Giorgio Armani", "femenino", ["floral", "gourmand"], "EDP", "clasica", 100, ["invierno"], ["noche"], 99990),
    (9057, "212 VIP", "Carolina Herrera", "femenino", ["gourmand", "frutal"], "EDP", "clasica", 80, ["verano"], ["noche"], 89990),
    (9058, "Bright Crystal", "Versace", "femenino", ["floral", "frutal"], "EDT", "clasica", 90, ["verano"], ["dia"], 74990),
    (9059, "Eros Pour Femme", "Versace", "femenino", ["gourmand", "floral"], "EDP", "clasica", 100, ["entretiempo"], ["noche"], 84990),
    (9060, "Light Blue Intense", "Dolce & Gabbana", "femenino", ["citrica", "floral"], "EDP", "intense", 100, ["verano"], ["dia"], 94990),
    (9061, "Paradoxe", "Prada", "femenino", ["floral", "amaderada"], "EDP", "clasica", 90, ["entretiempo"], ["noche"], 104990),
    (9062, "Bloom", "Gucci", "femenino", ["floral"], "EDP", "clasica", 100, ["entretiempo"], ["dia"], 99990),
    (9063, "Flora Gorgeous Gardenia", "Gucci", "femenino", ["floral", "frutal"], "EDT", "clasica", 100, ["verano"], ["dia"], 89990),
    (9064, "Her", "Burberry", "femenino", ["frutal", "gourmand"], "EDP", "clasica", 100, ["entretiempo"], ["noche"], 94990),
    (9065, "Burberry Body", "Burberry", "femenino", ["floral", "oriental"], "EDP", "clasica", 85, ["invierno"], ["noche"], 89990),
    (9066, "Born in Roma Donna", "Valentino", "femenino", ["floral", "amaderada"], "EDP", "clasica", 100, ["invierno"], ["noche"], 94990),
    (9067, "L'Interdit", "Givenchy", "femenino", ["floral", "oriental"], "EDP", "clasica", 80, ["invierno"], ["noche"], 94990),
    (9068, "Mon Guerlain", "Guerlain", "femenino", ["gourmand", "floral"], "EDP", "clasica", 100, ["entretiempo"], ["noche"], 99990),
    (9069, "Tresor", "Lancome", "femenino", ["floral", "oriental"], "EDP", "clasica", 100, ["invierno"], ["noche"], 89990),
    (9070, "For Her", "Narciso Rodriguez", "femenino", ["floral", "oriental"], "EDP", "clasica", 100, ["entretiempo"], ["noche"], 94990),
    (9071, "Flowerbomb", "Viktor & Rolf", "femenino", ["floral", "gourmand"], "EDP", "clasica", 100, ["invierno"], ["noche"], 109990),
    (9072, "Classique", "Jean Paul Gaultier", "femenino", ["floral", "oriental"], "EDP", "clasica", 100, ["invierno"], ["noche"], 94990),
    (9073, "Olympea", "Paco Rabanne", "femenino", ["gourmand", "floral"], "EDP", "clasica", 80, ["invierno"], ["noche"], 89990),
    (9074, "Lady Million", "Paco Rabanne", "femenino", ["floral", "frutal"], "EDP", "clasica", 80, ["entretiempo"], ["noche"], 89990),
    (9075, "Daisy", "Marc Jacobs", "femenino", ["floral", "frutal"], "EDT", "clasica", 100, ["verano"], ["dia"], 79990),
    (9076, "Le Parfum", "Elie Saab", "femenino", ["floral", "gourmand"], "EDP", "clasica", 90, ["entretiempo"], ["noche"], 99990),
    (9077, "My Way Intense", "Giorgio Armani", "femenino", ["floral", "gourmand"], "EDP", "intense", 90, ["invierno"], ["noche"], 99990),
    (9078, "Libre Intense", "Yves Saint Laurent", "femenino", ["floral", "aromatica"], "EDP", "intense", 90, ["invierno"], ["noche"], 104990),
    (9079, "Replica Jazz Club", "Maison Margiela", "unisex", ["especiada", "amaderada"], "EDT", "clasica", 100, ["invierno"], ["noche"], 94990),
    (9080, "Santal 33", "Le Labo", "unisex", ["amaderada"], "EDP", "clasica", 50, ["invierno"], ["noche"], 149990),
]

CAMPOS = [
    "id_producto", "nombre", "marca", "genero", "familia_olfativa", "formato",
    "version", "presentacion_ml", "temporada", "momento_uso", "precio_referencia",
]


def generar():
    catalogo = [dict(zip(CAMPOS, fila)) for fila in CATALOGO]
    return catalogo


if __name__ == "__main__":
    catalogo = generar()
    out_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "catalogo_perfumes.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(catalogo, f, ensure_ascii=False, indent=2)
    print(f"Catalogo generado: {len(catalogo)} fragancias -> {out_path}")
