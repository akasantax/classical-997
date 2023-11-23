import os, sys
import urllib.request
import re
import json
import xml.etree.ElementTree as ET
import xml.dom.minidom

TITLE = {
	"RA000018": "On Air",
	"RA000109": "Jazz",
	"RA000120": "Oldies but Goodies",
	"RA000129": "Kids",
	"RA000130": "UR Classical"
}

def fetch(keep_page=False):
    page = urllib.request.urlopen("https://www.e-classical.com.tw/index.html")

    content = page.read()
    content = content.decode()

    if keep_page:
        with open("rawpage.html", 'w', encoding="utf-8") as f:
            f.writelines(content)

    return content

def generate_xml(data):
    path = "./playlist/"
    isExist = os.path.exists(path)
    if not isExist:
        os.mkdir(path)

    for key in data:
        root = ET.Element("playlist", version="1", xmlns="http://xspf.org/ns/0/")
        track_list = ET.Element("trackList")
        track = ET.Element("track")
        track_list.append(track)
        title = ET.SubElement(track, "title")
        title.text = key
        loc = ET.SubElement(track, "location")
        loc.text = data[key]
        root.append(track_list)
        dom = xml.dom.minidom.parseString(ET.tostring(root))
        xml_string = dom.toprettyxml()
        part1, part2 = xml_string.split('?>')
        with open("./playlist/{}.xspf".format(key), 'w') as outfile:
            outfile.write(f"{part1} encoding=\"UTF-8\"?> {part2}")
    

if __name__ == "__main__":
    pattern = re.compile("(https://.+token=[\w-]*&expires=\d*)", flags = re.MULTILINE)
    
    try:
        content = fetch()
    except Exception:
        print("unable to connect")
        sys.exit(1)
    urls = pattern.findall(content)
    urls = urls[:-1]
    urls.sort()

    catagory = []
    for url in urls:
        cat = re.search("RA+\d*",url)
        catagory.append(cat.group(0))
    media_source = dict(zip(catagory, urls))

    generate_xml(media_source)
    d = [{'id':key, 'title':TITLE[key], 'link':value} for key,value in media_source.items()]
    json_data = json.dumps(d)
    # json_data = re.sub(r'(?<!: )"(\S*?)"', '\\1', json_data)
    with open("./web/data/media-source.json", "w") as outfile:
        outfile.write(json_data)
