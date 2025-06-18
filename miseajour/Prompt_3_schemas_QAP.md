Tu es un data-analyste Python expert en visualisation (matplotlib uniquement).

# 1. Données
Je vais te fournir un tableau brut (copie Excel/CSV) contenant :
- Critères
- Score Total
- Note sur 5   (décimales « . » ou « , » possibles)

<TABLEAU>
Critères,Score Total,Note sur 5
Ambition,24,4
Initiative,23,2,7
Résilience,19,2,9
Vision,18,4,2
Recul,19,3,3
Pertinence,19,4,2
Organisation,12,2,1
Décision,18,3,3
Sens du résultat,17,4,2
Communication,18,4
Esprit d'équipe,20,3,1
Leadership,20,4,6
</TABLEAU>

# 2. Préparation
1. Charge en DataFrame `df`.
2. Remplace les virgules décimales par des points et convertis en `float`.
3. Ajoute la colonne **Famille** :

```python
families = {
"VOULOIR": ["Ambition", "Initiative", "Résilience"],
"PENSER":  ["Vision", "Recul", "Pertinence"],
"AGIR":    ["Organisation", "Décision", "Sens du résultat"],
"ENSEMBLE":["Communication", "Esprit d'équipe", "Leadership"]
}
palette = {
"VOULOIR":  "#f47c20",  # orange
"PENSER":   "#1f77b4",  # bleu
"AGIR":     "#7f7f7f",  # gris
"ENSEMBLE": "#2ca02c"   # vert
}
3. Graphiques (PNG, 300 dpi, figsize=(8, 8), police sans-serif)
A. Radar « Vision globale des compétences »
Ordre FIXE : VOULOIR → PENSER → AGIR → ENSEMBLE, et dans chaque famille l’ordre de la liste ci-dessus.

Barres « polar » sans contour (edgecolor='none').

Couleurs = palette[Famille].

Affiche la valeur (x.y) au bout de chaque barre.

Titre : « Vision globale des compétences ».

B. Histogramme horizontal trié par score
Trie df par « Note sur 5 » décroissant.

Couleurs = palette.

Valeurs numériques à droite de chaque barre.

Titre : « Forces et axes de progression – Triés par score ».

C. Histogramme horizontal regroupé par famille
Contrainte de colonne invisible pour le label famille
Ordre vertical : VOULOIR (3 barres) → PENSER → AGIR → ENSEMBLE (12 barres au total).

Couleurs = palette.

Titre : « Forces par famille de compétences ».

Implémentation impérative
python
Copier
Modifier
import matplotlib.pyplot as plt
import numpy as np

# -- construction de l'axe "familles" vide à gauche
fig = plt.figure(figsize=(8, 8))
gs  = fig.add_gridspec(1, 2, width_ratios=[0.8, 4.2])   # ~16 % d’espace pour la colonne famille
ax_lbl = fig.add_subplot(gs[0, 0])   # colonne invisible (texte uniquement)
ax_bar = fig.add_subplot(gs[0, 1])   # histogramme

# -- Barres
for idx, row in df.iterrows():
ax_bar.barh(idx, row["Note sur 5"], color=palette[row["Famille"]])
ax_bar.text(row["Note sur 5"] + 0.05, idx, f'{row["Note sur 5"]:.1f}',
va='center', ha='left', fontsize=10)

# -- Texte des critères sur ax_bar
ax_bar.set_yticks(df.index, df["Critères"])
ax_bar.invert_yaxis()

# -- Texte des familles (ax_lbl)
ax_lbl.set_xlim(0, 1)
ax_lbl.set_ylim(-0.5, len(df) - 0.5)
ax_lbl.axis("off")

bloc = 0
for fam, crits in families.items():
idx_start = bloc
idx_end   = bloc + len(crits) - 1
y_center  = (idx_start + idx_end) / 2
ax_lbl.text(0.95, y_center, fam,
va='center', ha='right',
rotation=90, fontweight='bold',
fontsize=14, color=palette[fam])
bloc += len(crits)

ax_bar.set_xlabel("Score (1-5)")
fig.suptitle("Forces par famille de compétences", fontweight='bold')
Le premier sous-graphique (ax_lbl) ne contient aucune barre ni grille ; il n’affiche que le texte vertical des familles, aligné très à gauche (x = 0.95 dans l’axe muet → complètement en dehors des barres/labels de critères).

Ajuste éventuellement width_ratios ou ax_lbl.text(x=…) si ton tableau comporte plus ou moins de lignes.

4. Restitution
Sauvegarde :

radar_competences.png

barres_tries_score.png

barres_par_famille.png

Exécute le code avec python_user_visible pour générer et joindre les trois PNG.

Fournis un court résumé :

Points forts : critères ≥ 4 / 5

Axes d’amélioration : critères < 3 / 5

Moyenne de chaque famille (1 décimale).

Réponse finale :

les images jointes (ou lien de téléchargement)

le résumé synthétique

pas de code apparent (ou dans un bloc repliable “Voir code”).

Ne livre rien d’autre que les éléments demandés ci-dessus.