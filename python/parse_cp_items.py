import re
import json
import os
import hashlib
from bs4 import BeautifulSoup

def clean_html(html_content):
    """
    Cleans the HTML content by removing unnecessary tags and attributes.
    """
    soup = BeautifulSoup(html_content, 'html.parser')

    # Remove svg, path, g, span tags (as per previous logic, adapted if needed)
    # But here we need to keep some structure. 
    # The user provided snippet is relatively clean div structure.
    # We might not need heavy cleaning, but removing svgs is good.
    for tag in soup.find_all(['svg', 'path', 'g', 'button']):
        tag.decompose()

    attrs_to_remove = ['class', 'style', 'target', 'data-adsplatform', 'data-id', 'data-testid']
    for tag in soup.find_all(True):
        for attr in attrs_to_remove:
            if tag.has_attr(attr):
                del tag[attr]
                
    cleaned_str = str(soup)
    cleaned_str = cleaned_str.replace('\n', '').replace('\r', '')
    return cleaned_str

def parse_cp_products(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    products = []
    
    def stable_hash_id(*parts):
        h = hashlib.blake2b(digest_size=8)
        for part in parts:
            h.update((part or "").encode("utf-8"))
        return int.from_bytes(h.digest(), "big")

    # The structure is div.product-list > div.product-row > div.product-item
    # Since we might have cleaned classes, we should look for the structure or rely on what's left.
    # However, standard BS4 parsing on original HTML is often safer for class selection 
    # BEFORE cleaning if specific classes are needed.
    # Let's try parsing the input HTML directly without aggressive cleaning first, 
    # or just clean specific things.
    
    # Actually, let's use the input html directly with BS4 to find classes easily.
    soup = BeautifulSoup(html_content, 'html.parser')
    
    product_items = soup.find_all("div", class_="product-item")
    
    for item in product_items:
        # Image
        img_tag = item.find("div", class_="product-picture").find("img")
        thumb = img_tag['src'] if img_tag else ""
        
        # Name
        desc_div = item.find("div", class_="product-description")
        name = desc_div.get_text(strip=True) if desc_div else ""
        
        # Price
        price_div = item.find("div", class_="sale-price")
        price_text = price_div.get_text(strip=True) if price_div else ""
        # Extract number from price text
        price_match = re.search(r'[\d,]+', price_text)
        price_value = price_match.group() if price_match else "0"
        
        # Rating - not present in snippet, set to null or verify
        rating = None
        
        # Link - not present in snippet
        link = ""
        
        if name:
            products.append({
                "id": stable_hash_id(name, price_value),
                "thumb": thumb,
                "name": name,
                "price": price_value,
                "link": link,
                "category": "",
                "rating": rating
            })
            
    return products

if __name__ == "__main__":
    base_path = "parsing_data"
    output_path = os.path.join("src", "app", "tesla", "shop", "cp_products.json")
    
    all_products = []
    seen_ids = set()
    
    # Iterate files cp_tesla_1.txt to cp_tesla_10.txt
    for i in range(1, 11):
        file_name = f"cp_tesla_{i}.txt"
        file_path = os.path.join(base_path, file_name)
        
        if not os.path.exists(file_path):
            # print(f"[{file_name}] file not found. Skipping.")
            continue
            
        print(f"Parsing [{file_name}]...")
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()
            
        products = parse_cp_products(html_content)
        
        count = 0
        for product in products:
            if product["id"] not in seen_ids:
                seen_ids.add(product["id"])
                all_products.append(product)
                count += 1
        print(f"  - Added {count} unique products.")

    print(f"\nTotal unique products: {len(all_products)}")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
        
    print(f"Saved to: {output_path}")
