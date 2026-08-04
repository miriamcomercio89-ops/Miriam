# -*- coding: utf-8 -*-
"""Hitos históricos mensuales (realismo español, guerras ignoradas en ritmo)."""

from __future__ import annotations

# (year, month, title, detail, company_hint)
MILESTONES = [
    (1850, 1, "Arranque de la Red Ibérica", "Caja, mods base, primer depósito en Madrid y caminos propios.", "Compañía General"),
    (1851, 2, "Espíritu Madrid–Aranjuez", "Primera línea férrea española (1851). Conectar Madrid con Aranjuez.", "MZA spirit"),
    (1855, 6, "Ley General de Caminos de Hierro (espíritu)", "Priorizar magistrales radiales desde Madrid.", "Estado/concesiones"),
    (1856, 10, "Madrid–Albacete en marcha", "Empujar el corredor hacia Alicante (MZA).", "MZA"),
    (1858, 5, "Barcelona–Mataró ampliado", "Consolidar el litoral catalán con 'La Mataró'.", "Catalanas"),
    (1863, 4, "Norte hacia Valladolid", "Abrir Meseta norte: Madrid–Ávila–Medina–Valladolid.", "Norte"),
    (1865, 9, "Madrid–Zaragoza", "Diagonal del Ebro hacia el noreste.", "MZA"),
    (1866, 3, "Córdoba–Sevilla", "Entrada ferroviaria en el valle del Guadalquivir.", "Andaluces"),
    (1873, 1, "Tranvías urbanos pioneros", "Abrir tranvía de tracción animal/vapor en Madrid y Lisboa.", "Urbanas"),
    (1877, 8, "Bilbao y puerto", "Enganchar Bilbao al Norte y muelle de minerales.", "Norte"),
    (1881, 5, "Alicante terminal", "Completar MZA Madrid–Alicante con estación terminal.", "MZA"),
    (1885, 2, "Galicia embrionaria", "Empujar hacia León y prep. del Atlántico.", "Norte/Oeste"),
    (1890, 6, "Red radial consolidada", "Madrid unido a ≥12 capitales por ferrocarril.", "Multi"),
    (1898, 12, "Reorientación comercial", "Ignorar crisis colonial en obras; reforzar puertos.", "Puertos"),
    (1905, 4, "Expresos Norte/MZA", "Introducir Pacific/Mastodon en magistrales.", "Norte/MZA"),
    (1913, 7, "Electrificación experimental", "Preparar catenaria en rampas Norte.", "Norte"),
    (1919, 10, "Metro de Madrid", "Inaugurar línea 1 espíritu Sol–Cuatro Caminos.", "Metro Madrid"),
    (1924, 12, "Metro de Barcelona", "Primera línea de metro barcelonés.", "Metro BCN"),
    (1928, 1, "Eléctricas Norte 6100", "Explotación eléctrica en corredores de montaña.", "Norte"),
    (1933, 4, "Iberia aérea", "Primeros enlaces aéreos regulares con librea Iberia.", "Iberia"),
    (1941, 1, "RENFE unificada", "Renombrar operativa a RENFE; unificar libreas y depósitos.", "RENFE"),
    (1944, 6, "Mikados y atómicas", "Renovación vapor potente post-unificación.", "RENFE"),
    (1954, 6, "TER Fiat", "Rápidos diésel entre capitales.", "RENFE"),
    (1959, 12, "Metro de Lisboa", "Abrir metro lisboeta.", "Metropolitano"),
    (1965, 3, "Diéselización fuerte", "Retirar vapor en magistrales planas.", "RENFE"),
    (1975, 1, "Cercanías modernas", "Separar explotación cercanías en Madrid/Barcelona.", "RENFE"),
    (1980, 5, "Autopistas de peaje espíritu", "Buses ALSA interurbanos en red propia de carreteras.", "ALSA"),
    (1992, 4, "AVE Madrid–Sevilla", "Alta velocidad inaugural Expo 92.", "AVE"),
    (2003, 10, "AVE Madrid–Lérida/Barcelona en obras", "Empujar corredor NE de alta velocidad.", "AVE"),
    (2008, 2, "AVE Madrid–Barcelona", "Servicio completo Madrid–Barcelona.", "AVE"),
    (2010, 12, "AVE a Valencia", "Levante en alta velocidad.", "AVE"),
    (2015, 1, "Liberalización aérea/ferroviaria espíritu", "Ouigo/Iryo y lowcost en hubs.", "Multi"),
    (2020, 6, "Red AV mallada", "Madrid–todas las capitales AV o Avant.", "ADIF/RENFE"),
    (2035, 1, "Hidrógeno / duales", "EuroDual y mercancías limpias en no electrificado.", "Mercancías"),
    (2050, 12, "Red Ibérica completa", "Cobertura total ciudades + cadenas Akalipsia.", "Red Ibérica"),
]


def milestone_for(year: int, month: int):
    for y, m, title, detail, co in MILESTONES:
        if y == year and m == month:
            return {"title": title, "detail": detail, "company": co}
    return None
