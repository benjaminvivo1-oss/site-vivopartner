"""Remplace le logo flou du sweat (pose bras croisés) par le vrai logo Vivo Partner, net, à la bonne inclinaison."""
import numpy as np, cv2
from PIL import Image, ImageFilter

WHITE, ORANGE = np.array([242, 245, 250], np.float32), np.array([245, 130, 32], np.float32)

def logo_rgba(mark_path, word_path, H):
    """Logo pour le sweat : V blanc, P orange, « Vivo » / « Partner » en blanc sur deux lignes. H = hauteur du V/P en px."""
    mk = np.array(Image.open(mark_path).convert('RGBA')).astype(np.float32)
    a = mk[..., 3:] / 255
    hsv = cv2.cvtColor(np.clip(mk[..., :3], 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
    is_or = (hsv[..., 0] < 25) & (hsv[..., 1] > 90)
    mk[..., :3] = np.where(is_or[..., None], ORANGE, WHITE)
    ys, xs = np.where(a[..., 0] > 0.1); mk = mk[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    mark = Image.fromarray(mk.astype(np.uint8), 'RGBA'); mark = mark.resize((round(mark.width * H / mark.height), H), Image.LANCZOS)
    wd = np.array(Image.open(word_path).convert('RGBA')).astype(np.float32); wd[..., :3] = WHITE
    word = Image.fromarray(wd.astype(np.uint8), 'RGBA')
    vivo, partner = word.crop((0, 0, 341, word.height)), word.crop((343, 0, word.width, word.height))
    th = round(H * 0.40)
    vivo = vivo.resize((round(vivo.width * th / vivo.height), th), Image.LANCZOS)
    partner = partner.resize((round(partner.width * th / partner.height), th), Image.LANCZOS)
    x0 = mark.width + round(H * 0.16)
    W = x0 + max(vivo.width, partner.width) + 4; Ht = round(H * 1.12)
    out = Image.new('RGBA', (W, Ht), (0, 0, 0, 0))
    out.alpha_composite(mark, (0, 0)); out.alpha_composite(vivo, (x0, round(H * 0.12))); out.alpha_composite(partner, (x0, round(H * 0.60)))
    return out

def relogo(m, k, mark_path, word_path, box=(560, 558, 706, 626), anchor=(563.5, 565.0), mark_h=44.0, angle=-5.0):
    """m : mascotte RGBA déjà agrandie d'un facteur k depuis masc_bras.png. Retourne l'image corrigée."""
    img = np.array(m).astype(np.uint8); rgb = img[..., :3].copy()
    x0, y0, x1, y1 = [round(v * k) for v in box]
    reg = rgb[y0:y1, x0:x1].astype(np.float32)
    hsv = cv2.cvtColor(reg.astype(np.uint8), cv2.COLOR_RGB2HSV)
    lum = reg.mean(2)
    skin = (hsv[..., 0] < 25) & (hsv[..., 1] > 60) & (lum > 120)          # la main ne doit pas être effacée
    fabric = np.median(lum[~skin])
    old = ((lum > fabric + 9) | ((hsv[..., 0] < 25) & (hsv[..., 1] > 90))) & ~skin   # logo + son halo clair
    old = cv2.dilate(old.astype(np.uint8), np.ones((5, 5), np.uint8), iterations=max(1, round(k)))
    mask = np.zeros(rgb.shape[:2], np.uint8); mask[y0:y1, x0:x1] = old * 255
    clean = cv2.inpaint(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), mask, max(3, round(3 * k)), cv2.INPAINT_TELEA)
    clean = cv2.cvtColor(clean, cv2.COLOR_BGR2RGB)
    # le tissu « répare » : on lisse légèrement la zone repeinte pour qu'elle se fonde
    blur = cv2.GaussianBlur(clean, (0, 0), 2.0 * k)
    mm = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 1.5 * k)[..., None]
    clean = (clean * (1 - mm * 0.6) + blur * mm * 0.6).astype(np.uint8)
    # nouveau logo, incliné comme sur le sweat
    lg = logo_rgba(mark_path, word_path, round(mark_h * k * 4)).rotate(angle, resample=Image.BICUBIC, expand=True)
    lg = lg.resize((round(lg.width / 4), round(lg.height / 4)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.35 * k / 2.6))
    L = np.array(lg).astype(np.float32)
    px, py = round(anchor[0] * k - 2), round(anchor[1] * k - 2)
    h, w = L.shape[:2]; patch = clean[py:py + h, px:px + w].astype(np.float32)
    # ombrage du tissu (plis) reporté sur le logo
    fab = cv2.GaussianBlur(patch.mean(2), (0, 0), 3 * k); shade = np.clip(fab / np.median(fab), 0.72, 1.12)[..., None]
    la = L[..., 3:] / 255 * 0.97
    # la main reste devant le logo
    pr = clean[py:py + h, px:px + w]; phsv = cv2.cvtColor(pr, cv2.COLOR_RGB2HSV)  # image déjà nettoyée : l'orange de l'ancien logo n'y est plus
    pskin = ((phsv[..., 0] < 25) & (phsv[..., 1] > 60) & (pr.mean(2) > 110)).astype(np.float32)
    pskin = cv2.GaussianBlur(cv2.dilate(pskin, np.ones((3, 3), np.uint8)), (0, 0), 0.8 * k)[..., None]
    la = la * (1 - pskin)
    patch = patch * (1 - la) + (L[..., :3] * shade) * la
    clean[py:py + h, px:px + w] = np.clip(patch, 0, 255).astype(np.uint8)
    out = np.dstack([clean, img[..., 3]])
    return Image.fromarray(out, 'RGBA')
