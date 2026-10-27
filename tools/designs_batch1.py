"""Как рисовалась первая очередь брелоков (Elite, Pro, Origin, октябрь 2026) — образец для следующих пачек.
Результат уже перенесён в data/art.json и data/catalog.json; повторно не запускать, иначе ручные правки в art.json потеряются.
Проверка: python3 -I tools/designs_batch1.py печатает ключи и сетки."""
# Ячейки: r кант, d дека, p пэд, a акцент, b акцент 2, o кольцо, . пусто
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from artkit import AR9, TR9, RC9, AR11, base, put, fill, where, rows
def inside(g,r,c): return 0<=r<len(g) and 0<=c<len(g[0]) and g[r][c] in 'dpab'
def S(g): return '|'.join(rows(g))

D={}
# --- Elite 11.4 2022–2025: тот же рисунок, что у 12.6T, укорочен до 17 рядов
D['elite22akey']=dict(key='17x9',photo=2,rot=-90,
 art="...rrr...|.rdpdadr.|rdddadddr|rddadpddr|rdddddddr|rdddpppdr|raaddddpr|raadpppdr|raaddddpr|raadpppdr|raadppppr|raadppppr|rdddppppr|raadppppr|.rdddddr.|.rpppppr.|..rrorr..")

def elite26(widths,top):
    g=base(widths,9);t=top
    # «песочные часы» из шнуров
    fill(g,t,t,2,6,'p');put(g,[(t+1,3),(t+1,5),(t+2,4),(t+3,3),(t+3,5)],'p');fill(g,t+4,t+4,2,6,'p')
    p=t+6
    fill(g,p,p,2,3,'p');fill(g,p+1,p+1,1,5,'p');fill(g,p+2,p+6,1,7,'p')   # пэд с острым верхом слева
    put(g,[(p+1,6),(p+1,7),(p+2,4),(p+2,5),(p+2,6),(p+3,2),(p+3,3),(p+3,4),(p+4,1),(p+4,2)],'b')  # диагональная полоса
    o=p+4  # оранжевый треугольник к хвосту
    put(g,[(o,4)],'a');fill(g,o+1,o+1,3,5,'a');fill(g,o+2,o+2,2,6,'a');fill(g,o+3,o+3,1,7,'a')
    where(g,lambda r,c:r>o and r<o+3 and g[r][c]=='p' and c<4,'b')
    return g
D['elite26tkey']=dict(key='19x9',photo=8,art=S(elite26(TR9,2)))
D['elite26akey']=dict(key='17x9',photo=9,art=S(elite26(AR9,1)))

def gt26():
    g=base(RC9,9)
    put(g,[(3,2),(3,4),(4,3),(5,2),(5,4)],'p')          # двойной крест шнуров
    put(g,[(6,2),(6,6),(7,3),(7,5),(8,4)],'p')
    put(g,[(6,7),(8,7),(10,7)],'a')                     # жёлтые полосы справа у пэда
    fill(g,9,9,1,4,'p');fill(g,10,16,1,7,'p');put(g,[(10,7)],'a')
    put(g,[(11,5),(11,6),(11,7),(12,3),(12,4),(12,5),(13,1),(13,2),(13,3)],'b')
    put(g,[(14,4)],'a');fill(g,15,15,3,5,'a');fill(g,16,16,2,6,'a');fill(g,17,17,2,6,'a')
    return g
D['elite26gtkey']=dict(key='21x9',photo=10,art=S(gt26()))

def pro21():
    g=base(AR9,9)
    put(g,[(2,2),(2,3),(3,2),(3,3),(3,4),(4,3),(4,4),(5,4)],'a')   # белая «волна» в носу
    put(g,[(1,5),(2,6),(3,6)],'a')
    where(g,lambda r,c:r>=6 and g[r][c]=='d','p')                   # тёмно-синий пэд
    G=[".aaaaa.","a.....a","a......","a..aaaa","a.....a","a.....a",".aaaaa."]
    for i,row in enumerate(G):
        for j,ch in enumerate(row):
            if ch=='a': put(g,[(7+i,1+j)],'a')
    put(g,[(14,7),(13,7),(14,6)],'b')                               # лаймовый угол
    return g
D['pro21key']=dict(key='17x9',photo=11,art=S(pro21()))

def pro22b(widths,top):
    g=base(widths,9);t=top
    V=lambda a:[(a,4),(a+1,3),(a+1,5),(a+2,2),(a+2,6),(a+3,1),(a+3,7)]
    put(g,V(t),'a')                                                  # тонкий белый шеврон
    put(g,V(t+2)+V(t+3),'a')                                         # толстый белый шеврон
    t=t+1
    p=t+6
    put(g,[(p,4)],'p');fill(g,p+1,p+1,3,5,'p');fill(g,p+2,p+2,2,6,'p')
    end=len(g)-2
    where(g,lambda r,c:r>=p+3 and r<end and g[r][c]=='d','p')
    k=p+3   # красный низ: диагональ от правого борта вниз к левому
    where(g,lambda r,c:r>=k and r<end and g[r][c]=='p' and (r-k)*1.4 >= (7-c),'q')
    return g
for name,w,t,ph in (('pro22akey',AR9,1,12),('pro22tkey',TR9,2,13)):
    g=pro22b(w,t)
    D[name]=dict(key=f'{len(w)}x9',photo=ph,rot=-90,art=S(g).replace('q','b'))

def pro26(widths,top):
    g=base(widths,9);t=top
    where(g,lambda r,c:t<=r<=t+5 and g[r][c]=='d' and (r+c)%3==0,'a')   # косые полосы в носу
    p=t+6
    fill(g,p,p,4,7,'p');fill(g,p+1,p+1,1,7,'p')
    end=len(g)-2
    where(g,lambda r,c:r>p+1 and r<end and g[r][c]=='d','p')
    v=end-5   # светлый оранжевый блок с вершиной вверх
    put(g,[(v,4)],'b');fill(g,v+1,v+1,3,5,'b');fill(g,v+2,v+2,2,6,'b')
    where(g,lambda r,c:r>v+2 and r<end and g[r][c]=='p','b')
    return g
D['pro26akey']=dict(key='17x9',photo=16,art=S(pro26(AR9,1)))
D['pro26tkey']=dict(key='19x9',photo=17,art=S(pro26(TR9,2)))

def origin22(widths,W,top,rot=-90):
    g=base(widths,W);t=top;m=W//2
    for s_ in range(4):                                              # цветной шеврон в 2 ряда, под ним светлый
        put(g,[(t+s_,m-s_),(t+s_,m+s_),(t+s_+1,m-s_),(t+s_+1,m+s_)],'a')
    for s_ in range(4):
        put(g,[(t+3+s_,m-s_),(t+3+s_,m+s_)],'b')
    p=t+7;end=len(g)-2
    where(g,lambda r,c:p<=r<end and 1<=c<=W-2 and g[r][c]=='d','p')
    put(g,[(p,1),(p,2),(p,3)],'a')                                   # цветная линия у пэда
    put(g,[(p,1)],'a')
    return g
D['origin22akey']=dict(key='17x11',photo=18,rot=-90,art=S(origin22(AR11,11,1)))
D['origin22tkey']=dict(key='19x9',photo=19,rot=-90,art=S(origin22(TR9,9,2)))

def origin26(widths,W,top):
    g=base(widths,W);t=top;m=W//2
    where(g,lambda r,c:r<=t and g[r][c]=='d','b')                     # носовая «шапка»
    for r in range(len(g)):
        if r==0: g[r]=[('b' if ch=='r' else ch) for ch in g[r]]
    for s in range(0,m):                                             # цветной шеврон
        put(g,[(t+1+s,m-s),(t+1+s,m+s)],'a') if s<4 else None
    p=t+6;end=len(g)-2
    where(g,lambda r,c:p<=r<end and 1<=c<=W-2 and g[r][c]=='d','p')
    put(g,[(p,1),(p,2),(p-1,1),(p-1,2),(p-1,3)],'a')                 # косая плашка с надписью
    put(g,[(end-1,W-2),(end-1,W-3),(end-2,W-2),(end-2,W-3),(end-3,W-2)],'a')  # плашка у хвоста
    return g
D['origin26akey']=dict(key='17x11',photo=20,art=S(origin26(AR11,11,1)))
D['origin26tkey']=dict(key='19x9',photo=21,art=S(origin26(TR9,9,2)))

if __name__ == '__main__':
    for k, v in D.items():
        print(k, v['key']); print('\n'.join(v['art'].split('|')))
