# -*- coding: utf-8 -*-
"""Ciudades de la Red Ibérica y metadatos de expansión."""

from __future__ import annotations

# region: ES / PT / FR / DZ
CITIES = [
    # name, region, role, coast, activate_priority (lower = earlier)
    ("Madrid", "ES-MD", "hub", False, 1),
    ("Alcalá de Henares", "ES-MD", "satelite", False, 2),  # añadida: cercanías históricas
    ("Aranjuez", "ES-MD", "satelite", False, 2),  # añadida: primera línea 1851
    ("Toledo", "ES-CM", "regional", False, 8),
    ("Ávila", "ES-CL", "regional", False, 10),
    ("Segovia", "ES-CL", "regional", False, 12),
    ("Guadalajara", "ES-CM", "regional", False, 9),
    ("Cuenca", "ES-CM", "regional", False, 28),
    ("Ciudad Real", "ES-CM", "regional", False, 22),
    ("Albacete", "ES-CM", "nodo", False, 14),
    ("Valencia", "ES-VC", "hub", True, 16),
    ("Castellón de la Plana", "ES-VC", "regional", True, 30),
    ("Alicante", "ES-VC", "nodo", True, 18),
    ("Murcia", "ES-MC", "nodo", False, 24),
    ("Cartagena", "ES-MC", "puerto", True, 26),
    ("Barcelona", "ES-CT", "hub", True, 20),
    ("Tarragona", "ES-CT", "puerto", True, 32),
    ("Gerona", "ES-CT", "regional", False, 34),
    ("Lérida", "ES-CT", "nodo", False, 33),
    ("Zaragoza", "ES-AR", "hub", False, 15),
    ("Huesca", "ES-AR", "regional", False, 40),
    ("Teruel", "ES-AR", "regional", False, 42),
    ("Logroño", "ES-RI", "regional", False, 36),
    ("Pamplona", "ES-NC", "nodo", False, 35),
    ("San Sebastián", "ES-PV", "nodo", True, 31),
    ("Bilbao", "ES-PV", "hub", True, 19),
    ("Vitoria", "ES-PV", "nodo", False, 29),
    ("Santander", "ES-CB", "puerto", True, 27),
    ("Burgos", "ES-CL", "nodo", False, 17),
    ("Palencia", "ES-CL", "regional", False, 21),
    ("Valladolid", "ES-CL", "nodo", False, 11),
    ("León", "ES-CL", "nodo", False, 25),
    ("Zamora", "ES-CL", "regional", False, 37),
    ("Salamanca", "ES-CL", "nodo", False, 23),
    ("Soria", "ES-CL", "regional", False, 45),
    ("Oviedo", "ES-AS", "nodo", False, 28),
    ("Gijón", "ES-AS", "puerto", True, 29),
    ("La Coruña", "ES-GA", "puerto", True, 38),
    ("Santiago de Compostela", "ES-GA", "nodo", False, 39),
    ("Lugo", "ES-GA", "regional", False, 44),
    ("Orense", "ES-GA", "regional", False, 43),
    ("Vigo", "ES-GA", "puerto", True, 41),
    ("Badajoz", "ES-EX", "nodo", False, 34),
    ("Cáceres", "ES-EX", "regional", False, 36),
    ("Plasencia", "ES-EX", "regional", False, 46),
    ("Sevilla", "ES-AN", "hub", False, 13),
    ("Córdoba", "ES-AN", "nodo", False, 12),
    ("Cádiz", "ES-AN", "puerto", True, 20),
    ("Huelva", "ES-AN", "puerto", True, 35),
    ("Málaga", "ES-AN", "nodo", True, 22),
    ("Marbella", "ES-AN", "turismo", True, 55),
    ("Granada", "ES-AN", "nodo", False, 30),
    ("Jaen", "ES-AN", "regional", False, 33),
    ("Almería", "ES-AN", "puerto", True, 40),
    ("Motril", "ES-AN", "puerto", True, 58),
    ("Palma de Mallorca", "ES-IB", "isla", True, 50),
    ("Manacor", "ES-IB", "isla", False, 60),
    # Portugal
    ("Lisboa", "PT", "hub", True, 48),
    ("Setúbal", "PT", "puerto", True, 52),
    ("Évora", "PT", "regional", False, 54),
    ("Faro", "PT", "turismo", True, 56),
    ("Beja", "PT", "regional", False, 57),  # añadida
    ("Coímbra", "PT", "nodo", False, 51),
    ("Leiria", "PT", "regional", False, 53),
    ("Figueira da Foz", "PT", "puerto", True, 55),
    ("Oporto", "PT", "hub", True, 49),
    ("Braga", "PT", "regional", False, 54),
    ("Viseu", "PT", "regional", False, 58),
    ("Catelo Blanco", "PT", "regional", False, 59),  # Castelo Branco (nombre del mapa)
    # Francia
    ("Bayona", "FR", "frontera", True, 47),
    ("Pau", "FR", "frontera", False, 53),
    ("Toulouse", "FR", "hub_ext", False, 61),
    ("Carcasona", "FR", "regional", False, 62),
    ("Perpiñán", "FR", "frontera", False, 46),
    # Argelia / Magreb
    ("Argel", "DZ", "hub_ext", True, 65),
    ("Khemis Miliana", "DZ", "regional", False, 70),
    ("Mostagem", "DZ", "puerto", True, 68),
]

# Ciudades añadidas por la guía (además de la lista del usuario)
ADDED_CITIES_NOTE = [
    "Alcalá de Henares (cercanías Madrid)",
    "Aranjuez (primera línea histórica 1851)",
    "Beja (nexo Alentejo / Faro)",
]

STATION_NAME = {
    "Madrid": "Madrid Atocha",
    "Madrid_norte": "Madrid Chamartín",
    "Madrid_delicias": "Madrid Delicias",
    "Madrid_principe": "Madrid Príncipe Pío",
    "Barcelona": "Barcelona Sants",
    "Barcelona_nord": "Barcelona França",
    "Sevilla": "Sevilla Santa Justa",
    "Valencia": "Valencia Nord",
    "Bilbao": "Bilbao Abando",
    "Lisboa": "Lisboa Santa Apolónia",
    "Oporto": "Porto Campanhã",
    "Zaragoza": "Zaragoza Delicias",
    "Málaga": "Málaga María Zambrano",
    "Alicante": "Alicante Terminal",
    "Córdoba": "Córdoba Central",
    "Valladolid": "Valladolid Campo Grande",
    "Burgos": "Burgos Rosa de Lima",
    "Santander": "Santander",
    "La Coruña": "A Coruña",
    "Santiago de Compostela": "Santiago de Compostela",
    "Gijón": "Gijón",
    "Oviedo": "Oviedo",
    "Pamplona": "Pamplona",
    "San Sebastián": "Donostia-San Sebastián",
    "Granada": "Granada",
    "Almería": "Almería",
    "Cádiz": "Cádiz",
    "Badajoz": "Badajoz",
    "Salamanca": "Salamanca",
    "León": "León",
    "Palma de Mallorca": "Palma Intermodal",
    "Toulouse": "Toulouse Matabiau",
    "Perpiñán": "Perpignan",
    "Bayona": "Bayonne",
    "Argel": "Alger Centre",
}


def cities_by_priority():
    return sorted(CITIES, key=lambda c: (c[4], c[0]))


def city_names():
    return [c[0] for c in cities_by_priority()]


def coastal_cities():
    return [c[0] for c in CITIES if c[3]]


def hubs():
    return [c[0] for c in CITIES if c[2] in ("hub", "hub_ext")]
