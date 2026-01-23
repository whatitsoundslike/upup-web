# -*- coding: utf-8 -*-
from bs4 import BeautifulSoup
import re
import os
import hashlib
import json

class Product:
    def __init__(self, name, link, thumbnail_url, discount_rate=None, price=None):
        self.name = name
        self.link = link
        self.thumbnail_url = thumbnail_url
        self.discount_rate = discount_rate
        self.price = price

    def __str__(self):
        return (f"상품명: {self.name}\n"
                f"링크: {self.link}\n"
                f"썸네일: {self.thumbnail_url}\n"
                f"할인율: {self.discount_rate if self.discount_rate else '없음'}\n"
                f"가격: {self.price}\n"
                + "-"*30)

def parse_products(html_content):
    """
    정제된 HTML(ul/li 구조)을 파싱하여 Product 객체 리스트를 반환합니다.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    products = []

    def stable_hash_id(*parts):
        h = hashlib.blake2b(digest_size=8)
        for part in parts:
            h.update((part or "").encode("utf-8"))
        return int.from_bytes(h.digest(), "big")

    # 각 상품 li 태그 순회
    for li in soup.find_all('li'):
        # 1. 상품 링크 (첫 번째 a 태그)
        a_tag = li.find('a')
        link = "https://www.coupang.com" + a_tag['href'] if a_tag and a_tag.has_attr('href') else "N/A"

        # 2. 썸네일 URL 및 상품 이름 (img 태그)
        img_tag = li.find('img')
        thumb = img_tag['src'] if img_tag and img_tag.has_attr('src') else "N/A"
        name = img_tag['alt'] if img_tag and img_tag.has_attr('alt') else "N/A"

        # 3. 할인율 및 가격 (div 내 텍스트 검색)
        discount = None
        price = None
        
        # li 내부의 모든 텍스트 요소를 확인하여 %와 원을 찾음
        texts = li.find_all(string=True)
        for text in texts:
            text_strip = text.strip()
            if not text_strip: continue
            
            # 할인율 (%) - 숫자+% 형태 검색
            if '%' in text_strip and not discount:
                match = re.search(r'\d+%', text_strip)
                if match:
                    discount = match.group()
            
            # 가격 (원) - 숫자+원 형태 검색
            if '원' in text_strip and not price:
                # '원'이 포함된 문자열에서 숫자와 콤마만 추출하여 가격 정보 확인
                if any(char.isdigit() for char in text_strip):
                    price = text_strip

        price_match = re.search(r'[\d,]+', price) if price else None
        price_value = price_match.group() if price_match else None

        rating = None
        for tag in li.find_all(attrs={"aria-label": True}):
            label = tag.get("aria-label", "").strip()
            if re.fullmatch(r"\d+(\.\d+)?", label):
                rating = float(label)
                break

        products.append({
            "id": stable_hash_id(name),
            "thumb": thumb,
            "name": name,
            "price": price_value,
            "link": link,
            "category": "",
            "rating": rating,
        })
    
    return products

def clean_html(html_content):
    """
    HTML 문자열을 입력받아 다음 작업을 수행합니다:
    1. svg, path, g 태그 제거
    2. 모든 태그의 'class', 'style', 'target' 속성 제거
    3. 비어있는 div 태그 제거
    4. 개행문자 제거
    """
    soup = BeautifulSoup(html_content, 'html.parser')

    # 1. 특정 태그(svg, path, g, span) 및 사용자 정의 필터링 태그 완전히 제거
    for rocket in soup.find_all(attrs={"data-badge-id": "ROCKET"}):
        rocket.decompose()

    for rocket in soup.find_all(attrs={"data-badge-id": "ROCKET_MERCHANT"}):
        rocket.decompose()

    for img in soup.find_all('img'):
        if img.has_attr('src') and '/image/badges/cashback' in img['src']:
            img.decompose()

    for target in soup.find_all(['svg', 'path', 'g', 'span', 'del']):
        target.decompose()

    # 2. 모든 남은 태그에서 속성 삭제
    attrs_to_remove = ['class', 'style', 'target', 'data-adsplatform', 'data-id', 'data-testid']
    for tag in soup.find_all(True):
        for attr in attrs_to_remove:
            if tag.has_attr(attr):
                del tag[attr]

    # 3. 비어있는 div 태그 제거
    for div in reversed(soup.find_all('div')):
        if not div.get_text(strip=True) and not div.find_all():
            div.decompose()

    # 4. 중첩 구조 평탄화
    changed = True
    while changed:
        changed = False
        for div in soup.find_all('div'):
            real_children = [c for c in div.children if c.name]
            if len(real_children) == 1 and real_children[0].name == 'div':
                if div.get_text(strip=True) == real_children[0].get_text(strip=True):
                    div.unwrap()
                    changed = True
                    break

    # 5. 개행문자 제거
    cleaned_str = str(soup)
    cleaned_str = cleaned_str.replace('\n', '').replace('\r', '')
    
    return cleaned_str

if __name__ == "__main__":
    base_path = "parsing_data"
    output_path = os.path.join("src", "app", "tesla", "shop", "products.json")
    
    all_products = []
    seen_ids = set()
    
    # coupang_tesla_1.txt ~ 5.txt 순회
    for i in range(1, 6):
        file_name = f"coupang_tesla_{i}.txt"
        file_path = os.path.join(base_path, file_name)
        
        if not os.path.exists(file_path):
            print(f"[{file_name}] 파일을 찾을 수 없습니다. 건너뜁니다.")
            continue
            
        print(f"[{file_name}] 파싱 중...")
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()
            
        cleaned_html = clean_html(html_content)
        products = parse_products(cleaned_html)
        
        # 중복 제거 및 리스트 추가
        for product in products:
            if product["id"] not in seen_ids:
                seen_ids.add(product["id"])
                all_products.append(product)
                
    print(f"\n총 {len(all_products)}개의 상품(중복 제거됨)을 저장합니다.")

    # 결과 저장
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
        
    print(f"저장 완료: {output_path}")
