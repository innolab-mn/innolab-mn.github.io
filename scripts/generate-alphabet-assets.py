"""Generate original illustrated letter SVGs from OFL font outlines.

Requires fonttools (pip install fonttools). Run from the repository root.
Font sources and licenses are retained in public/fast_read/vendor/fonts/.
"""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
local_tools = ROOT / '.fast-read-tools' / 'fonttools'
if local_tools.exists():
    sys.path.insert(0, str(local_tools))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools import subset

SITE = ROOT / 'public' / 'fast_read'
OUT = SITE / 'assets' / 'alphabet'
OUT.mkdir(parents=True, exist_ok=True)
FONT_DIR = SITE / 'vendor' / 'fonts'
FONTS = [('nunito', 'Nunito', 'Зөөлөн'), ('comfortaa', 'Comfortaa', 'Бөөрөнхий'), ('serif', 'NotoSerif', 'Уламжлалт'), ('handwritten', 'Caveat', 'Бичмэл')]
RUNTIME_NAMES = {'nunito':'FastReadSoft', 'comfortaa':'FastReadRound', 'serif':'FastReadSerif', 'handwritten':'FastReadHandwritten'}
ROWS = [
 ('a','А','Алим','#dd7e73','apple'), ('b','Б','Бөмбөг','#769dd2','ball'),
 ('v','В','Автобус','#d5ac69','bus'), ('g','Г','Гэр','#c4a17d','ger'),
 ('d','Д','Дугуй','#83b3a3','bike'), ('ye','Е','Есөн','#d6ac6c','nine'),
 ('yo','Ё','Гоё','#bd92be','gift'), ('zh','Ж','Жимс','#a28ab8','grapes'),
 ('z','З','Загас','#81b5cc','fish'), ('i','И','Интоор','#d4898c','cherry'),
 ('short-i','Й','Нохой','#c6ad94','dog'), ('k','К','Кино','#92a7c6','movie'),
 ('l','Л','Лууван','#dd9b60','carrot'), ('m','М','Мод','#87a67e','tree'),
 ('n','Н','Нар','#dfb45e','sun'), ('o','О','Онгоц','#83a9c8','plane'),
 ('oe','Ө','Өндөг','#c9b79c','egg'), ('p','П','Панда','#8baf99','panda'),
 ('r','Р','Робот','#8fabc0','robot'), ('s','С','Сар','#d8b96c','moon'),
 ('t','Т','Туулай','#c6ad94','rabbit'), ('u','У','Ус','#76b3d2','water'),
 ('ue','Ү','Үүл','#aaa6cc','cloud'), ('f','Ф','Футбол','#8fae98','football'),
 ('kh','Х','Хаалга','#b59373','door'), ('ts','Ц','Цэцэг','#91aa7e','flower'),
 ('ch','Ч','Чихэр','#d593a1','candy'), ('sh','Ш','Шувуу','#83a4c6','bird'),
 ('shch','Щ','Ш → Щ','#a897bc','comparison'), ('hard-sign','Ъ','Явъя','#c7a272','path'),
 ('y','Ы','Нарны','#d5ad62','sun'), ('soft-sign','Ь','Морь','#b18b72','horse'),
 ('e','Э','Эрвээхэй','#aa93c6','butterfly'), ('yu','Ю','Аюулгүй','#88b7b1','crossing'),
 ('ya','Я','Ямаа','#b6ad95','goat'),
]
VOWELS = set('АЕЁИЙОӨУҮЫЭЮЯ')
SPECIAL = {'soft-sign','hard-sign','shch','y','f','k'}
CONTEXT = {'v','yo','short-i','yu'}
USAGE = {'v': ('inside', 1, 'Автобус гэдэг үгийн дунд в байна. Хамтдаа тэр үсгийг олъё.'),
         'yo': ('ending', 2, 'Гоё бэлэг байна! Гоё гэдэг үгийн төгсгөлд ё байна.'),
         'yu': ('inside', 1, 'Замын гарцаар том хүнтэй хамт гаръя. Аюулгүй гэдэг үгийн дунд ю байна.'),
         'short-i': ('ending', 4, 'Нохой гэдэг үгийн төгсгөлд й байна.'),
         'hard-sign': ('inside', 2, 'Хатуугийн тэмдэг. Явъя гэдэг үгийн дунд ъ байна. Өөрөө авиа илэрхийлэхгүй.'),
         'y': ('ending', 4, 'Нарны гэдэг үгийн төгсгөлд ы байна. Үг энэ үсгээр эхэлдэггүй.'),
         'soft-sign': ('ending', 3, 'Зөөлний тэмдэг. Морь гэдэг үгийн төгсгөлд ь байна. Өөрөө авиа илэрхийлэхгүй.'),
         'shch': ('shape', 4, 'Ш ба Щ үсгийг харьцуулъя. Щ үсэг баруун доороо жижиг сүүлтэй. Нэр, танихгүй үг цээжлэх хэрэггүй.')}

# The letter outline remains intact. Texture is clipped to it; small semantic
# features grow from its strokes, with a matching object in the lower corner.
MOTIFS = {
 'apple': ('<path d="M160 67q-8-22 8-35" stroke="#87644d" fill="none"/><path d="M163 48q13-27 37-16-7 25-37 16" fill="#91b07d" stroke="none"/>', '<path d="M270 256q-19-11-28 6-7 16 7 33 9 9 21 2 12 7 21-2 14-17 7-33-9-17-28-6" fill="#df8c7f"/><path d="M270 256v-12m0 2q10-15 22-6-9 12-22 6" fill="#8daa79"/>'),
 'ball': ('', '<circle cx="271" cy="275" r="27" fill="#8eaed4"/><path d="M250 259q26 8 36 37m-42-20q26 9 49-10m-25-18q-15 31 9 53" fill="none" stroke="#eaf0f8"/>'),
 'vase': ('<path d="M75 65h41m-38 7h35" stroke="#846d62" fill="none"/>', '<path d="m255 249 5 16q-28 38 10 40 38-2 10-40l5-16z" fill="#c79d83"/><path d="M252 284h35m-31 9h27" stroke="#f8e2bd"/>'),
 'ger': ('<path d="m67 70 22-20 36 20" fill="#e4bc86"/><path d="M90 49v-7" stroke="#ac8463"/>', '<path d="m239 273 33-26 34 26v29h-67z" fill="#f3e2c4"/><path d="M239 273h67m-40 12h13v17h-13z" fill="#c49673"/>'),
 'bike': ('', '<g fill="none"><circle cx="242" cy="288" r="17"/><circle cx="295" cy="288" r="17"/><path d="m242 288 19-28 16 28h-35l43-22 10 22m-10-22-3-13h10m-37 7h13" stroke="#6d9d90"/></g>'),
 'cake': ('', '<circle cx="274" cy="277" r="29" fill="#dbb37c"/><circle cx="274" cy="277" r="20" fill="none" stroke="#b98e5f"/><path d="m273 261 5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="#f5dbaa" stroke="none"/>'),
 'sugar': ('', '<path d="m247 265 24-15 28 13v29l-24 15-28-13z" fill="#eef5f8"/><path d="m247 265 28 12 24-14m-24 14v30" fill="none" stroke="#b7cbd4"/>'),
 'grapes': ('<path d="M159 74q-1-23 24-33m-22 16q-25-19-37 2 18 17 37-2" fill="#a1b288"/>', '<g fill="#b199c3"><circle cx="254" cy="266" r="11"/><circle cx="275" cy="265" r="11"/><circle cx="295" cy="269" r="11"/><circle cx="264" cy="284" r="11"/><circle cx="285" cy="286" r="11"/><circle cx="275" cy="301" r="10"/></g><path d="M275 253q-1-15 13-19" fill="none" stroke="#8caa7b"/>'),
 'fish': ('<path d="m106 70 16-16 13 18" fill="#91c2d4"/>', '<path d="m293 274 16-14v32l-16-12q-32 30-56-4 24-31 56-2" fill="#95bfd1"/><circle cx="250" cy="273" r="3" fill="#425a70" stroke="none"/>'),
 'cherry': ('<path d="M95 75q8-22 26-26" fill="none" stroke="#8da27c"/>', '<path d="m253 278 17-39 25 37m-25-37q-15-7-23 2" stroke="#8ca178" fill="none"/><circle cx="252" cy="286" r="17" fill="#d49292"/><circle cx="296" cy="284" r="17" fill="#d49292"/>'),
 'rabbit': ('<path d="M95 74q-18-43-2-46 14 3 12 46m19-1q4-42 19-35 11 9-8 42" fill="#e5d2bd"/>', '<path d="M264 264q-14-45-2-43 12 6 12 42m4 0q7-43 18-32 4 9-8 36" fill="#e6d5c2"/><ellipse cx="275" cy="285" rx="28" ry="23" fill="#e6d5c2"/><path d="M263 281v1m22-1v1m-13 8 4 3 4-3" stroke="#7d6c65"/>'),
 'kangaroo': ('<path d="M94 77q-20-37-9-39 14 1 19 35m5 4q9-35 19-24 5 8-7 29" fill="#d3b28d"/>', '<path d="M272 267q-20-24-8-32l13 18 13-16q15 20-5 32l8 23 19 10-37-4-12-17-13 20" fill="#d0b08c"/>'),
 'dragon': ('<path d="m75 195-26-10 19-22-5-19 27 12m119 20 28-27 5 27 19 8-35 21" fill="#a5c191"/>', '<path d="M248 290q-10-25 9-36l23 5 15-16 9 10-11 18 8 18-20 15h-36l22-15" fill="#a4bf95"/><circle cx="279" cy="264" r="3" fill="#4d6550" stroke="none"/>'),
 'tree': ('<g fill="#a3bc93" stroke="none"><ellipse cx="86" cy="76" rx="30" ry="20"/><ellipse cx="160" cy="96" rx="24" ry="17"/><ellipse cx="231" cy="76" rx="29" ry="20"/></g>', '<path d="M269 277v29" stroke="#a38366" stroke-width="10"/><path d="M249 282q-16-17 0-27-1-25 24-21 26-4 26 21 19 15 0 28-22 9-26-1-13 8-24 0" fill="#a5bd92"/>'),
 'sun': ('<path d="M160 48V33m-95 62-13-8m215 8 13-8m-14 151 13 10m-216-10-13 10" stroke="#dfbc72" fill="none"/>', '<circle cx="274" cy="276" r="23" fill="#e7c478"/><path d="M274 243v-8m0 74v8m-33-41h-8m74 0h8m-64-25-6-6m55 55 6 6m-55-6-6 6m55-55 6-6" stroke="#d6af62"/>'),
 'plane': ('<path d="m76 152-35 20 35 7m168-27 35 20-35 7" fill="#a9c4d9"/>', '<path d="M244 275h30l13-26h8l-6 26h18v8h-19l5 18h-7l-12-18h-30z" fill="#a2bed5"/>'),
 'egg': ('', '<path d="M275 241s-30 32-30 45a30 26 0 0 0 60 0c0-13-30-45-30-45z" fill="#efe1c4"/><path d="m251 276 10 6 12-8 12 8 13-8" fill="none" stroke="#d0bca0"/>'),
 'panda': ('<circle cx="87" cy="68" r="15" fill="#59686b"/><circle cx="233" cy="68" r="15" fill="#59686b"/>', '<circle cx="253" cy="253" r="10" fill="#5b6c68"/><circle cx="295" cy="253" r="10" fill="#5b6c68"/><circle cx="274" cy="277" r="29" fill="#eff1e7"/><ellipse cx="263" cy="275" rx="7" ry="10" fill="#6c7971"/><ellipse cx="286" cy="275" rx="7" ry="10" fill="#6c7971"/><path d="m271 290 4 3 4-3" stroke="#617167"/>'),
 'robot': ('<path d="M150 70V43" stroke="#849baa"/><circle cx="150" cy="39" r="7" fill="#d9b479"/>', '<rect x="244" y="254" width="60" height="47" rx="10" fill="#b0c3ce"/><path d="M274 254v-12m-18 29h5m26 0h5m-30 16h23" stroke="#657f92"/><circle cx="274" cy="239" r="5" fill="#e2b77b"/>'),
 'moon': ('<path d="m256 73 4 9 10 1-8 6 3 10-9-5-9 5 2-10-7-6 10-1z" fill="#d9bd7b" stroke="none"/>', '<path d="M294 245q-38 4-30 31 6 23 35 13-15 25-40 13-29-18-8-44 16-18 43-13" fill="#e7ca84"/>'),
 'water': ('<circle cx="77" cy="57" r="6" fill="#b4d7e5" stroke="none"/><circle cx="246" cy="83" r="8" fill="#b4d7e5" stroke="none"/>', '<path d="M275 240s-29 32-29 44a29 25 0 0 0 58 0c0-12-29-44-29-44z" fill="#94c6dc"/><path d="M259 281q-1 10 10 15" fill="none" stroke="#e5f6fc"/>'),
 'cloud': ('<path d="M54 78q-7-14 9-18 3-18 20-12 16-8 23 7 16 0 17 16l-69 7m151-8q-5-16 10-19 6-17 21-7 15-6 20 10 14 0 13 15z" fill="#c6c5df" stroke="none"/>', '<path d="M245 290q-14-26 13-33 9-25 29-9 27-1 23 26 5 17-20 20h-45z" fill="#c6c5df"/>'),
 'flamingo': ('<path d="M160 75q-4-36 20-31l16 11-21 8" fill="#e1a8b9"/><path d="m183 47 13 8-13 3" fill="#607080"/>', '<path d="M266 279q-23-1-20 17 25 21 48-3-1-12-20-14 19-12 4-26-11-10-1-17" fill="#dfa6b7"/><path d="M264 302v12m19-12-6 11" stroke="#b28691"/>'),
 'door': ('', '<path d="M250 244h48v66h-48z" fill="#c8a783"/><path d="M258 254h31v46h-31z" fill="none" stroke="#a3856b"/><circle cx="286" cy="279" r="3" fill="#eed597" stroke="none"/>'),
 'flower': ('<g fill="#e4a8b4" stroke="none"><circle cx="89" cy="62" r="18"/><circle cx="225" cy="62" r="18"/></g><g fill="#efd28a" stroke="none"><circle cx="89" cy="62" r="7"/><circle cx="225" cy="62" r="7"/></g>', '<path d="M274 283v29m0-10-17-10m17 3 18-11" stroke="#8da57c"/><g fill="#e2a8b5"><circle cx="260" cy="268" r="12"/><circle cx="275" cy="254" r="12"/><circle cx="290" cy="268" r="12"/><circle cx="285" cy="283" r="12"/><circle cx="264" cy="283" r="12"/></g><circle cx="275" cy="270" r="11" fill="#eed18b"/>'),
 'candy': ('', '<path d="m246 268-13-11v34l13-11m53-12 13-11v34l-13-11" fill="#e0bac3"/><rect x="245" y="257" width="55" height="35" rx="13" fill="#df9dab"/><path d="m257 258 19 33m-2-34 18 30" stroke="#fff1e5" stroke-width="7"/>'),
 'umbrella': ('<path d="M65 66q24-43 48 0m83 0q24-43 48 0" fill="#a8c2db"/>', '<path d="M238 273q36-51 72 0-12-12-24 0-12-12-24 0-12-12-24 0" fill="#9bbad4"/><path d="M274 267v34q0 15-13 7" stroke="#718ba4" fill="none"/>'),
 'author': ('<path d="M92 77V45h11v32m53 0V39h12v38m52 0V50h12v27" fill="#d3bd96"/>', '<path d="M272 262q-19-10-37-3v43q18-7 37 3 18-10 38-3v-43q-20-7-38 3" fill="#eee5d4"/><path d="M272 262v43m10-27 14-17" stroke="#a58a6d"/>'),
 'path': ('<path d="m230 77 16-8-16-8" fill="none" stroke="#d1ad72"/>', '<path d="M240 300q52 6 33-29-12-24 30-24" stroke="#c7ab83" stroke-width="13" fill="none"/><path d="m296 239 10 8-10 8" stroke="#ab8d68" fill="none"/>'),
 'horse': ('<path d="m91 78-11-33 24 15 17-23 5 40" fill="#c8a487"/>', '<path d="m258 302-1-25-13-9 15-24 29 12 14 42-18 7-11-20-2 19" fill="#c6a182"/><path d="m257 248 17-16 8 23" fill="#92735e"/><circle cx="264" cy="265" r="3" fill="#66564d" stroke="none"/>'),
 'butterfly': ('<path d="M165 73q-3-21-16-25m16 25q6-21 19-25" fill="none" stroke="#9e86b9"/>', '<path d="M274 276q-33-47-38-9-1 20 24 16-22 31 1 26l13-22 13 22q23 5 1-26 25 4 24-16-5-38-38 9" fill="#c3afd7"/><path d="M274 267v31m0-30-8-12m8 12 8-12" stroke="#9f88b5"/>'),
 'funnel': ('', '<path d="m237 248 76 0-29 31v24l-18 10v-34z" fill="#a5c9c2"/><path d="M237 248h76" stroke="#779e97"/>'),
 'turtle': ('<path d="m226 93 23-4 12 10-15 10" fill="#a4bd98"/>', '<ellipse cx="271" cy="278" rx="29" ry="24" fill="#aac29d"/><path d="m259 261 23 2 8 17-17 16-19-13z" fill="none" stroke="#87a47c"/><circle cx="307" cy="276" r="10" fill="#b9cba9"/><path d="m253 295-9 10m42-9 7 9" stroke="#8ba77f"/>')
}

# Larger, literal objects for examples that children found hard to recognize.
# Keep the actual object prominent instead of relying on a tiny corner symbol.
OBJECTS = {
 'bus': '<rect x="22" y="47" width="158" height="104" rx="18" fill="#e8bf62"/><path d="M32 59h91v48H32z" fill="#badce5"/><path d="M62 59v48m31-48v48" fill="none"/><rect x="137" y="61" width="28" height="78" rx="5" fill="#dcecf0"/><path d="M151 62v77M24 119h101" fill="none"/><circle cx="58" cy="150" r="20" fill="#596c83"/><circle cx="151" cy="150" r="20" fill="#596c83"/><circle cx="58" cy="150" r="8" fill="#dce6ec"/><circle cx="151" cy="150" r="8" fill="#dce6ec"/><rect x="25" y="130" width="13" height="9" rx="2" fill="#fff4bd"/>',
 'carrot': '<path d="M89 53q-38-39-28-48 19-10 38 45-3-52 14-49 20 7-3 51 36-43 47-28 9 18-40 39" fill="#8fb56f"/><path d="M71 53q30-12 57 8 15 13-1 46-24 45-60 80-9 6-7-8 3-48-2-82-3-30 13-44z" fill="#eea25e"/><path d="m70 89 25 9m-25 30 16 6m10-21 22 7m-51 30 11 4" fill="none" stroke="#c97b3e"/>',
 'egg': '<ellipse cx="100" cy="176" rx="66" ry="8" fill="#d8d7ca" stroke="none"/><path d="M101 22C75 22 41 89 44 125c3 34 28 51 57 51s53-17 56-51c3-36-30-103-56-103z" fill="#fffaf0" stroke="#b4a58c" stroke-width="4"/><path d="M65 94q5-23 19-39" fill="none" stroke="#fff" stroke-width="10"/><path d="M130 115q32-21 47 8 21 41-26 53-38-2-36-30 1-17 15-31" fill="#fffdf5" stroke="#b4a58c"/><ellipse cx="147" cy="146" rx="18" ry="20" fill="#edc45c" stroke="#d6aa49"/>',
 'goat': '<path d="m149 97 29-19-9 28" fill="#d7c9ac"/><path d="M43 118v56h17v-48m72-2v50h18v-58" fill="#d9cdb5"/><ellipse cx="104" cy="112" rx="61" ry="38" fill="#e6dcc8"/><path d="M63 75q-34-14-38 3l29 17m24-20q27-18 35-5L91 91" fill="#e8dcc1"/><path d="M53 58q-21-22-9-42 1 23 22 31m13 3q25-8 22-31 17 19-6 41" fill="#b6a28b"/><path d="M48 59q19-18 41 1l3 43q-5 25-24 26-24-2-25-25z" fill="#f2e8d3"/><path d="m58 122 9 31 10-31" fill="#cbb994"/><circle cx="57" cy="82" r="3" fill="#506070"/><circle cx="81" cy="82" r="3" fill="#506070"/><path d="m64 106 5 4 5-4M43 174h17m72 0h18" fill="none"/>',
 'bird': '<path d="m53 118-30-11 17 31 24-3" fill="#91bbd4"/><path d="M52 118q-8-40 23-61 35-20 63 11l7 47q-8 46-51 44-29 0-42-41z" fill="#9fc4dc"/><path d="m140 79 35 13-32 13" fill="#e9bd69"/><path d="M72 107q22-16 44 8-11 32-38 14" fill="#d8e8ef"/><circle cx="122" cy="80" r="4" fill="#405872"/><path d="m82 158-5 23m27-23 3 23m-37 0h14m16 0h14" fill="none"/>',
 'dog': '<path d="M55 71 28 49q-23 62 9 77l30-36m78-19 27-22q23 62-9 77l-30-36" fill="#aa7c56"/><path d="M47 99q0-52 53-52t53 52v31q0 43-53 43t-53-43z" fill="#dfb789"/><ellipse cx="100" cy="130" rx="33" ry="29" fill="#f6dfba"/><circle cx="77" cy="95" r="4" fill="#4f5662"/><circle cx="123" cy="95" r="4" fill="#4f5662"/><path d="M88 121q12-10 24 0l-12 11z" fill="#5a5355"/><path d="M100 132v11m-15-3q15 20 30 0" fill="none"/><path d="M97 151v15q12 7 15-9" fill="#d9a09d"/>',
 'movie': '<rect x="20" y="44" width="160" height="112" rx="12" fill="#7794b6"/><rect x="30" y="54" width="140" height="90" rx="5" fill="#eaf2f5"/><path d="M30 55h21v89H30m119-89h21v89h-21" fill="#db9d9b"/><path d="m85 74 37 27-37 27z" fill="#d3b46f"/><path d="M79 156v15m41-15v15m-56 0h72" fill="none"/><path d="m40 29 21 9m99-9-21 9" stroke="#d3b46f"/>',
 'football': '<path d="M27 106V33h146v73" fill="#e2ede3"/><path d="M27 33h146v73H27zm29 0v73m29-73v73m29-73v73m29-73v73M27 58h146m-146 24h146" fill="none" stroke="#a3b9a4" stroke-width="2"/><circle cx="105" cy="137" r="45" fill="#f8f8f0"/><path d="m105 112 20 14-7 24H93l-8-24zm-41 7 21 7m8 24-13 21m38-21 13 21m-6-45 22-7m-42-7V93" fill="#697c72"/>',
 'gift': '<rect x="35" y="77" width="130" height="98" rx="8" fill="#b6c8e5"/><rect x="27" y="61" width="146" height="31" rx="7" fill="#9eafd4"/><path d="M88 62h23v112H88" fill="#e9b391"/><path d="M99 62q-62-8-41-36 24-13 41 36m1 0q62-8 41-36-24-13-41 36" fill="#efc2a4"/><path d="m23 29 3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1m143-5 3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1" fill="#d8bd70" stroke="none"/>',
 'crossing': '<rect x="19" y="102" width="164" height="77" rx="9" fill="#b5c0cb" stroke="none"/><path d="m24 160 19-41h15l-19 41zm28 0 19-41h15l-19 41zm28 0 19-41h15l-19 41zm28 0 19-41h15l-19 41zm28 0 19-41h15l-19 41z" fill="#fffaf0" stroke="none"/><rect x="112" y="17" width="55" height="75" rx="10" fill="#809c94"/><circle cx="140" cy="38" r="6" fill="#ddedc3" stroke="none"/><path d="m140 48-7 16-10 5m17-21 11 15m-13-3-10 21m10-21 13 21" stroke="#ddedc3" stroke-width="5" fill="none"/><path d="M139 92v26" stroke="#8d9fa4"/>',
}
OBJECTS['nine'] = ''.join(f'<circle cx="{x}" cy="{y}" r="20" fill="{["#e4ad88","#9abbd6","#b0c694"][(xi+yi)%3]}"/>' for yi,y in enumerate([47,100,153]) for xi,x in enumerate([47,100,153]))

def glyph_path(font, character):
    cmap = font.getBestCmap()
    if ord(character) not in cmap:
        raise ValueError(f'Missing {character} in {font["name"].getDebugName(1)}')
    glyphs = font.getGlyphSet()
    glyph = glyphs[cmap[ord(character)]]
    bounds = BoundsPen(glyphs)
    glyph.draw(bounds)
    x0,y0,x1,y1 = bounds.bounds
    scale = min(184/(x1-x0), 186/(y1-y0))
    pen = SVGPathPen(glyphs)
    glyph.draw(TransformPen(pen,(scale,0,0,-scale,160-(x0+x1)*scale/2,250+y0*scale)))
    return pen.getCommands()

def make_svg(path, color, motif=None, reference=None):
    if not motif:
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><path d="{path}" fill="{color}"/></svg>'
    if motif == 'comparison':
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><g transform="translate(-2 44) scale(.52)"><path d="{reference}" fill="#b6bdca"/></g><path d="M139 143h31m-11-9 12 9-12 9" stroke="#8b769f" stroke-width="4" fill="none" stroke-linecap="round"/><g transform="translate(151 44) scale(.52)"><path d="{path}" fill="{color}"/></g><circle cx="276" cy="172" r="16" stroke="#d9b667" stroke-width="3" stroke-dasharray="4 4" fill="none"/></svg>'
    if motif in OBJECTS:
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><ellipse cx="207" cy="291" rx="91" ry="10" fill="{color}" opacity=".12"/><g transform="translate(-12 -10) scale(.72)"><path d="{path}" fill="{color}"/></g><path d="M139 102q39-12 56 20" fill="none" stroke="{color}" stroke-width="2" stroke-dasharray="4 5" opacity=".45"/><g transform="translate(112 104)" stroke="#526179" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">{OBJECTS[motif]}</g></svg>'
    accent, icon = MOTIFS[motif]
    texture = '<path d="M60 100q100 35 200 0m-200 40q100 35 200 0m-200 40q100 35 200 0m-200 40q100 35 200 0" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="5"/>'
    if motif in ['apple','egg','cake','sugar','turtle','fish']:
        texture = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="3" ry="5" fill="#fff" fill-opacity=".4"/>' for x,y in [(90,105),(142,122),(204,99),(106,179),(167,203),(219,167),(80,224),(234,224)])
    if motif == 'candy':
        texture = '<path d="m40 75 180 180m-135-210 180 180M30 129l120 120" stroke="#fff1df" stroke-width="14" opacity=".7"/>'
    if motif == 'path':
        texture = '<path d="M82 81h130v50H122v93h84" fill="none" stroke="#fff7df" stroke-width="5" stroke-dasharray="9 10"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><defs><clipPath id="letter"><path d="{path}"/></clipPath></defs><ellipse cx="159" cy="264" rx="106" ry="10" fill="{color}" opacity=".11"/><path d="{path}" fill="{color}" stroke="{color}" stroke-width="1.5" stroke-linejoin="round"/><g clip-path="url(#letter)">{texture}</g><g stroke="#526179" stroke-opacity=".45" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{accent}{icon}</g></svg>'

data=[]
font_objects={}
charset=''.join(row[1]+row[1].lower() for row in ROWS)
for font_id,filename,label in FONTS:
    font=TTFont(FONT_DIR/f'{filename}.ttf')
    axes={axis.axisTag: (700 if axis.axisTag=='wght' else axis.defaultValue) for axis in font['fvar'].axes} if 'fvar' in font else {}
    if axes: font=instantiateVariableFont(font,axes,inplace=True)
    font_objects[font_id]=font
    # Separate small runtime fonts; SVGs themselves contain only vector paths.
    runtime=TTFont(FONT_DIR/f'{filename}.ttf')
    if axes: runtime=instantiateVariableFont(runtime,axes,inplace=True)
    subsetter=subset.Subsetter()
    subsetter.populate(text=charset+' ')
    subsetter.subset(runtime)
    # Modified fonts receive original names, including the Comfortaa RFN.
    family=RUNTIME_NAMES[font_id]
    names={1:family,2:'Regular',3:family+'-Regular-v1',4:family+' Regular',6:family+'-Regular',16:family,17:'Regular'}
    for record in list(runtime['name'].names):
        if record.nameID in names:
            runtime['name'].setName(names[record.nameID],record.nameID,record.platformID,record.platEncID,record.langID)
    runtime.save(FONT_DIR/f'{family}.ttf')

for index,(letter_id,upper,word,color,motif) in enumerate(ROWS):
    usage,highlight,note=USAGE.get(letter_id,('initial',0,f'{word} гэдэг үг {upper} үсгээр эхэлнэ.'))
    assert word[highlight].upper()==upper, (letter_id,word,highlight)
    variants={}
    for font_id,_,_ in FONTS:
        stem=f'{letter_id}-{font_id}'
        path=glyph_path(font_objects[font_id],upper)
        files={'illustrated':f'{stem}.svg','upper':f'{stem}-plain.svg','lower':f'{stem}-lower.svg'}
        for kind,filename in files.items():
            content=make_svg(path,color,motif,glyph_path(font_objects[font_id],'Ш') if motif=='comparison' else None) if kind=='illustrated' else make_svg(glyph_path(font_objects[font_id],upper if kind=='upper' else upper.lower()),'#344362')
            (OUT/filename).write_text(content,encoding='utf-8')
        variants[font_id]={key:f'assets/alphabet/{value}' for key,value in files.items()}
    data.append({'id':letter_id,'order':index+1,'upper':upper,'lower':upper.lower(),'word':word,'highlightIndex':highlight,'usage':usage,'lesson':'special' if letter_id in SPECIAL else 'context' if letter_id in CONTEXT else 'beginner','kind':'sign' if upper in 'ЪЬ' else 'vowel' if upper in VOWELS else 'consonant','note':note,'color':color,'motif':motif,'variants':variants})

result={'version':1,'fonts':[{'id':font_id,'label':label,'family':RUNTIME_NAMES[font_id],'sourceFamily':filename,'file':f'vendor/fonts/{RUNTIME_NAMES[font_id]}.ttf'} for font_id,filename,label in FONTS],'source':'https://toli.gov.mn/r','letters':data}
(SITE/'data'/'alphabet.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Generated {len(data)} letters x {len(FONTS)} fonts x 3 image states = {len(data)*len(FONTS)*3} SVG assets; {len(FONTS)} local font subsets.')
