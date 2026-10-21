import os
import shutil
import argparse
from PIL import Image, ImageDraw, ImageFont

BACKUP_DIR = os.path.join('images', 'backup_watermarked_original')
IMAGE_DIR = 'images'
IMAGE_NUMBERS = list(range(2, 68)) # 2 to 67, 66 images

def ensure_backup():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    backed_up = 0
    for num in IMAGE_NUMBERS:
        src = os.path.join(IMAGE_DIR, f'{num}.99096.jpg')
        dst = os.path.join(BACKUP_DIR, f'{num}.99096.jpg')
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copy2(src, dst)
            backed_up += 1
    if backed_up > 0:
        print(f'Backed up {backed_up} original images to {BACKUP_DIR}')
    else:
        print(f'Backup directory already up to date ({len(IMAGE_NUMBERS)} images preserved).')

def remove_watermark(im):
    """Cleanly reconstruct background gradient using Coons surface interpolation."""
    px = im.load()
    x0, x1 = 265, 515
    y0, y1 = 498, 550
    w_box = x1 - x0
    h_box = y1 - y0

    # Sample clean surrounding rows and columns (3-pixel average to smooth noise)
    top = [tuple(int(sum(px[x, y0 - k][ch] for k in range(1, 4)) / 3.0) for ch in range(3)) for x in range(x0, x1 + 1)]
    bottom = [tuple(int(sum(px[x, y1 + k][ch] for k in range(1, 4)) / 3.0) for ch in range(3)) for x in range(x0, x1 + 1)]
    left = [tuple(int(sum(px[x0 - k, y][ch] for k in range(1, 4)) / 3.0) for ch in range(3)) for y in range(y0, y1 + 1)]
    right = [tuple(int(sum(px[x1 + k, y][ch] for k in range(1, 4)) / 3.0) for ch in range(3)) for y in range(y0, y1 + 1)]

    p00, p10, p01, p11 = top[0], top[-1], bottom[0], bottom[-1]

    for y_idx, y in enumerate(range(y0, y1 + 1)):
        v = y_idx / float(h_box)
        om_v = 1.0 - v
        c_l = left[y_idx]
        c_r = right[y_idx]
        for x_idx, x in enumerate(range(x0, x1 + 1)):
            u = x_idx / float(w_box)
            om_u = 1.0 - u
            c_t = top[x_idx]
            c_b = bottom[x_idx]
            
            r = int(om_v * c_t[0] + v * c_b[0] + om_u * c_l[0] + u * c_r[0] - (om_u * om_v * p00[0] + u * om_v * p10[0] + om_u * v * p01[0] + u * v * p11[0]))
            g = int(om_v * c_t[1] + v * c_b[1] + om_u * c_l[1] + u * c_r[1] - (om_u * om_v * p00[1] + u * om_v * p10[1] + om_u * v * p01[1] + u * v * p11[1]))
            b = int(om_v * c_t[2] + v * c_b[2] + om_u * c_l[2] + u * c_r[2] - (om_u * om_v * p00[2] + u * om_v * p10[2] + om_u * v * p01[2] + u * v * p11[2]))
            
            px[x, y] = (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)))

def apply_branding(im):
    """Draw stylish SOFINT SOLUTIONS / CREATIVE DESIGN STUDIO text matching original Century Gothic aesthetics."""
    draw = ImageDraw.Draw(im)
    font_reg = ImageFont.truetype(r'C:\Windows\Fonts\GOTHIC.TTF', 17)
    font_bold = ImageFont.truetype(r'C:\Windows\Fonts\GOTHICB.TTF', 17)
    font_sub = ImageFont.truetype(r'C:\Windows\Fonts\GOTHIC.TTF', 9)

    # Main brand title: 'SOFINT' regular + 'SOLUTIONS' bold
    bbox_part1 = draw.textbbox((0, 0), 'SOFINT', font=font_reg)
    w_part1 = bbox_part1[2] - bbox_part1[0]

    bbox_part2 = draw.textbbox((0, 0), 'SOLUTIONS', font=font_bold)
    w_part2 = bbox_part2[2] - bbox_part2[0]

    total_w = w_part1 + w_part2
    start_x = (800 - total_w) // 2
    y1 = 512

    draw.text((start_x, y1), 'SOFINT', fill=(60, 64, 70), font=font_reg)
    draw.text((start_x + w_part1, y1), 'SOLUTIONS', fill=(35, 38, 42), font=font_bold)

    # Subtitle: 'CREATIVE DESIGN STUDIO' spaced out
    sub_text = '  '.join(list('CREATIVE DESIGN STUDIO'))
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    w_sub = bbox_sub[2] - bbox_sub[0]
    x_sub = (800 - w_sub) // 2
    y_sub = 534

    draw.text((x_sub, y_sub), sub_text, fill=(110, 115, 122), font=font_sub)

def process_all(mode='branded'):
    ensure_backup()
    
    if mode == 'restore':
        for num in IMAGE_NUMBERS:
            src = os.path.join(BACKUP_DIR, f'{num}.99096.jpg')
            dst = os.path.join(IMAGE_DIR, f'{num}.99096.jpg')
            if os.path.exists(src):
                shutil.copy2(src, dst)
        print(f'Restored all {len(IMAGE_NUMBERS)} original images from backup.')
        return

    processed = 0
    for num in IMAGE_NUMBERS:
        src = os.path.join(BACKUP_DIR, f'{num}.99096.jpg')
        dst = os.path.join(IMAGE_DIR, f'{num}.99096.jpg')
        if not os.path.exists(src):
            continue
            
        im = Image.open(src).convert('RGB')
        remove_watermark(im)
        
        if mode == 'branded':
            apply_branding(im)
            
        im.save(dst, quality=95, subsampling=0)
        processed += 1
        
    print(f'Successfully updated {processed} images in mode: "{mode.upper()}"')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Update logo mockup images')
    parser.add_argument('--mode', choices=['branded', 'clean', 'restore'], default='branded',
                        help='Mode: "branded" (Sofint Solutions watermark), "clean" (no text), "restore" (revert to original)')
    args = parser.parse_args()
    process_all(args.mode)
