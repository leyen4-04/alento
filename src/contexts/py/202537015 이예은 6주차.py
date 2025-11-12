# 1.(3)
#     pilow에서 이미지 저장 시 암축 품질을 설정하는 인자는 quality이다
# 오답
#     resolution과 dpi는 해상도와 관련된 인자이다
#     compress는 압축 자체를 의미하는단어이다.

# 2(3)
#     이미지의 픽셀 값을 가져오는 함수는 getpixel()이다
#     getpixel()함수는 특정좌표(x,y)에 있는 픽셀의 색상값을 반환한다.
# 오답
#     get,getvalue()는 픽셀 값을 가져오는 표준 함수가 아니며, pixel()은 존재하지 않는다

# 3(2)
#     알파 채널을 포함하는 모드는 RGRA이다.
#     RGBA는 Red, Geen,blue에 alpha(투명도) 채널이 추가된 모드이다.
# 오답
#     RGB: red, green, blue 세가지 색상 채널을 사용한다
#     CMYK : 네가지 색상 채널로 인쇄용으로 사용한다
#     L: 픽셀을 0(검정색) 부터 255(흰색)까지 갑으로 표현하는 흑백모드이다
# 4(2)
#      새로운 빈 이미지 생성하는 함수는 image.new()함수이며, 
#      mode, size(가로와 세로 튜플), color(기본 배경색) 세가지 인자를 받는다.
# 오답 
#     나머지는 pillow에서 제공하는 표준 함수가 아니다.

# 5(3)
#     pages는 페이지 객체들의 리스트입니다.
#     과거에선 numpages, getNumPages 메서드를 사용했으나 
#     최신버전인 PyPdF2에선 pages속성을 사용한다

# 6(1)
#     PdfReader 객체에서 특정 페이지 객체를 가져온 후, 
#     해당 페이지의 텍스트를 추출하려면 extract_text() 메서드를 사용합니다.


# 7(3)
#     PdfWriter 객체를 사용하여 PDF 파일을 저장할 때, 
#     encrypt() 메서드를 호출하면 암호를 설정하여 문서를 암호화할 수 있습니다.

# 8(1)
#     getPage(index) 메서드를 사용해 페이지 객체를 가져온다.
# 오답
#     readPage(),  selectPage(),  pickPage(): 페이지를 가져오는 동작을 묘사하는 단어들이지만,
#     PyPDF2 라이브러리에서 페이지 객체를 얻기 위해 사용하는 표준 메서드 이름이 아니다.

9
import os
from PIL import Image

try:
    file_list = os.listdir('.')
except FileNotFoundError:
    print("오류: 현재 폴더 경로를 찾을 수 없습니다.")
    file_list = []

image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp')

for filename in file_list:

    if filename.lower().endswith(image_extensions):
        try:
         
            with Image.open(filename) as img:
                grayscale_img = img.convert('L')
                
                new_filename = f"L_{filename}"
                
                grayscale_img.save(new_filename)
                
                print(f"변환 완료: {new_filename}")

        except Exception as e:
            print(f"'{filename}' 처리 중 오류 발생: {e}")


10
from PIL import Image

source_filename = 'flower.png'
output_filename = 'cropped_flower.gif'

try:
    with Image.open(source_filename) as img:
        crop_area = (0, 0, 500, 500)
        
        cropped_img = img.crop(crop_area)
        
        cropped_img.save(output_filename)
        
        print(f"{output_filename} 이미지 크롭 완료!")

except FileNotFoundError:
    print(f"오류: '{source_filename}' 파일을 찾을 수 없습니다.")
except Exception as e:
    print(f"이미지 처리 중 오류 발생: {e}")