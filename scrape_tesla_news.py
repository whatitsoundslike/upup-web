# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime, timedelta
import re

def get_headers():
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

def parse_korean_relative_time(s, now=None):
    """
    '17분 전', '1시간 전', '2일 전' 같은 상대시간을
    ISO 포맷 문자열(예: '2026-01-23T12:34:56')로 변환.
    못 맞추면 원문 문자열 반환.
    """
    if not s:
        return None

    s = s.strip()
    if now is None:
        now = datetime.now()

    dt = None

    # Handle relative time (17분 전, 1시간 전...)
    m = re.match(r"(\d+)\s*분\s*전", s)
    if m:
        dt = now - timedelta(minutes=int(m.group(1)))

    m = re.match(r"(\d+)\s*시간\s*전", s)
    if m:
        dt = now - timedelta(hours=int(m.group(1)))

    m = re.match(r"(\d+)\s*일\s*전", s)
    if m:
        dt = now - timedelta(days=int(m.group(1)))

    # Handle absolute Korean date (2026년 01월 22일)
    m = re.match(r"(\d+)년\s*(\d+)월\s*(\d+)일", s)
    if m:
        try:
            # Assume time is 00:00:00 for dates without time
            dt = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except:
            pass

    if dt:
        return dt.isoformat(timespec="seconds")

    return s

def scrape_naver_news(keyword="테슬라"):
    print("Scraping Naver News for {}...".format(keyword))
    news_list = []
    try:
        url = "https://search.naver.com/search.naver?where=news&query={}&sm=tab_opt&sort=1&photo=0&field=0&pd=0&ds=&de=&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Ar%2Cp%3Aall&is_sug_officeid=0".format(keyword)
        response = requests.get(url, headers=get_headers())
        soup = BeautifulSoup(response.text, 'html.parser')
        
        items = soup.select("ul.list_news div.sds-comps-vertical-layout")

        for item in items:
            # 제목 + 링크
            tit_a = item.select_one('a[data-heatmap-target=".tit"]')
            title = tit_a.get_text(strip=True) if tit_a else None
            link = tit_a.get("href") if tit_a else None

            # 디스크립션
            body_a = item.select_one('a[data-heatmap-target=".body"]')
            description = body_a.get_text(" ", strip=True) if body_a else None

            # 썸네일
            img = item.select_one('a[data-heatmap-target=".img"] img')
            thumbnail = img.get("src") if img else None

            # 발행 시간(표기)
            # 같은 item 안에 '17분 전' 같은 텍스트가 profile 영역에 있음
            time_text = None
            for t in item.select(".sds-comps-profile-info-subtext span"):
                txt = t.get_text(strip=True)
                # '전'이 들어간 텍스트를 찾음 (e.g. 17분 전)
                if "전" in txt: 
                    time_text = txt
                    break

            published_at = parse_korean_relative_time(time_text) if time_text else None

            # 최소한 제목/링크가 있는 것만 수집
            if title and link:
                news_list.append({
                    "source": "Naver",
                    "title": title,
                    "link": link,
                    "description": description,
                    "thumbnail": thumbnail,
                    "published_at": published_at,   
                })
                
    except Exception as e:
        print("Error scraping Naver: {}".format(e))
        
    return news_list

def scrape_investing_news(keyword="테슬라"):
    print("Scraping Investing.com for {}...".format(keyword))
    news_list = []
    try:
        # Investing.com search URL for news
        url = "https://kr.investing.com/search/?q=%ED%85%8C%EC%8A%AC%EB%9D%BC&tab=news"
        response = requests.get(url, headers=get_headers())
        
        if response.status_code != 200:
            print("Failed to fetch Investing.com: Status {}".format(response.status_code))
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        
        articles = soup.select('.articleItem') 
        if not articles:
             articles = soup.select('div.largeTitle')

        for article in articles:
            # title + link
            a_title = article.select_one("a.title")
            title = a_title.get_text(strip=True) if a_title else ""
            link = "https://kr.investing.com" + a_title.get("href", "") if a_title else ""

            # thumbnail
            img_tag = article.select_one("a.img img")
            thumbnail = ""
            if img_tag:
                thumbnail = (
                    img_tag.get("src")
                    or img_tag.get("data-src")
                    or img_tag.get("data-original")
                    or ""
                )

            # description
            p = article.select_one("p.js-news-item-content")
            description = p.get_text(" ", strip=True) if p else ""

            # published date
            date_text = ""
            time_tag = article.select_one("time.date")
            if time_tag:
                date_text = time_tag.get_text(strip=True)

            published_at = parse_korean_relative_time(date_text)

            # 최소 필드 정리
            if title and link:
                news_list.append({
                    "source": "Investing.com",
                    "title": title,
                    "link": link,
                    "thumbnail": thumbnail,
                    "description": description,
                    "published_at": published_at,   
                })
    except Exception as e:
        print("Error scraping Investing.com: {}".format(e))
        
    return news_list

def main():
    all_news = []
    
    # Scrape Naver
    naver_news = scrape_naver_news()
    all_news.extend(naver_news)
    print("Found {} articles from Naver.".format(len(naver_news)))
    
    # Scrape Investing.com
    investing_news = scrape_investing_news()
    all_news.extend(investing_news)
    print("Found {} articles from Investing.com.".format(len(investing_news)))

    # Deduplicate by title
    # Using a dictionary to preserve order of first occurrence while filtering duplicates
    unique_news = {}
    for item in all_news:
        title = item.get('title')
        if title and title not in unique_news:
            unique_news[title] = item
    
    all_news = list(unique_news.values())
    print("Unique articles: {}".format(len(all_news)))
    
    # Sort by published_at (descending)
    all_news.sort(key=lambda x: x.get('published_at') or "", reverse=True)

    # Save to JSON
    output_path = os.path.join("src", "app", "news", "news.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)
    
    print("\nSuccessfully scraped {} articles.".format(len(all_news)))
    print("Saved to {}".format(output_path))

if __name__ == "__main__":
    main()
