# 1.(2) 
# self 키워드는 자기자신을 가리키는 단어로, 메서드를 호출한 그 인스턴스 자신을 정확히 가리켜 속성 값을 저장하거나 불러올때 사용하므로 현재 인스턴스를 참조하는 역할이다
# 오답 
# -전역 변수 선언: global 키워드를 사용하다
# -프로그램 종료는 exit()나, sys.exit()같은 함수를 사용한다.

# 2.(1)
#     캡슐화는 중요한 데이터(속성)와 그 데이터르 다루는 함수(메서드)를 하나의 캡슐로 묶고, 외부에서 함부로 데이터에 접근하지 못하도록 막는 것을 의미한다.
#     따라서 1번  외부에 불필요한 정보를 숨기고 필요한 부분만 노출한다

# 3.(2)
#     생성자는 클래스의 인스턴스가 처음 만들어질때 한 번 자동으로 호출되는 특별한 메서드 이다.
#     __init__이라는 이름으로 생성자를 정의 한다. 이름 앞뒤에 두개의__ 밑줄이 붙는 것이 특징이다
# 오답
#  __del__ : 소멸자로 객체가 사라질떄 호출된다
#  __str__ : 객체를 문자열로 표현할때 사용된다.
#  __main__: 파이썬 파일이 직접 실행될 때 사용되는 특별한 변수 이름이다

# 4.(2)
#     클래스 변수는  클래스 내부에 직접 선언하며, 그 클래스로부터 만들어진 모든 인스턴스들이 함께 공유하는 변수이다
#     인스턴스 변수는 주로 __init__메서드 안에서 self.변수명 형태로 선언되며, 각 인스턴스마다 독립적으로 소유하는 변수로, 객체마다 다르다.
 
# 5.(2) 
#     _str_메서드는 반드시 문자열을 반환해야한다.

# 6.(2)
#     다중 상속은 하나의 클래스가 여러 부모 클래스로부터 상속받는 것이다. 다른 부모 클래스에 같은 이름의 메서드가 존재하면, 해당 메서드를 호출했을떄 어떤 부모의 메서드를 
#     실행해야하는지 모르는 문제가 발생한다. 이는 메서드 탐색 순서 혼란이된다.

# 7.(1)
#      객체지향 설계 원칙(solid)클래스는 단 하나의 책임만 가져야 한다. 


# 8.
# import json #JSON 형식을 사용하기에 맨 앞에 불러와야한다
# student_list=[] # 빈 리스트를 만들어서 나중에 학생들 정보를 저장할 수 있도록 한다



# while True: 
   
    
#     student_data = {}

#     student_data['학번'] =  input("학번: ")
#     student_data['이름'] =  input("이름: ")
#     student_data['국어'] =  int(input("국어: "))
#     student_data['수학'] =  int(input("수학: "))
#     student_data['영어'] =  int(input("영어: "))



#     student_list.append(student_data) # 빈 리스트에 학생 한명 저장

   

#     answer = input("입력을 계속하시겠습니까? (Y/N): ") 
#     if answer in  'Nn' :
#         break

# with open('student.info','w')as f: # 파일에다가 저장
#     json.dump(student_list,f) 

# with open('student.info','r')as f:
#     read_list = json.load(f)

# for student in read_list:
#     print(student)


# 9.()
# import pickle

# book_list=[] 

#  # 빈 리스트안에 반복문으로 딕셔너리 값 대입
# isOk = True

# while isOk:
#     book_data={} # 딕셔너리 저장 
#     book_data['title'] = input("제목: ")
#     book_data['author'] = input("저자: ")
#     book_data['pub'] = input("출판사:" )
#     book_data['year'] = int(input("출판연도: "))
#     book_data['isbn'] = int(input("ISBN: "))

#     book_list.append(book_data)

#     answer = input('계속 입력할까요? Y/N: ')
#     if answer in 'nN':
#         isOk = False
#         print(" 입력종료")

# #  파일에다가 저장(pickle은 바이너리(0,1로만)형태이므로 'wb'로 나타내야한다.)
# with open('book.info','wb') as f:
#     pickle.dump(book_list,f)
 
# #  파일에다가 읽기
# with open('book.info','rb') as f:
#     read_book = pickle.load(f)

# for one_list in read_book:
#     print(one_list)



# 10
# import pickle

# # book 클래스 정의
# class BOOK: 
    
#     def __init__(self, title, author, pub, year, isbn):
#         self.title =title
#         self.author = author
#         self.pub =pub
#         self.year = year
#         self.isbn = isbn

#     # book 클래스에서 출력
#     def __str__(self):
#         return f"제목 : {self.title}, 저자 : {self.author}, 출판사 : {self.pub}, 출판연도 : {self.year}, ISBN : {self.isbn}"

    
# # 저장된 파일 읽어오기
# with open('book.info','rb')as f:
#     read_book = pickle.load(f)
# print("데이터를 모두 읽어 변환했습니다")


# # 9번 딕셔너리를 book객체로 변환하기
# new_book = []  
# for book_data in new_book:

#     # BOOK 클래스의 생성자(__init__)에 전달.
#     new_book_object = BOOK(
#         title=book_data['title'],
#         author=book_data['author'],
#         pub=book_data['pub'],
#         year=book_data['year'],
#         isbn=book_data['isbn']
#     )

#     new_book.append(new_book_object)


# #새로 파일에 저장히기
# with open('Book1.info', 'wb') as f:
#     pickle.dump(new_book, f)

# #다시 읽어오기
# with open('Book1.info', 'rb') as f:
#     read_book = pickle.load(f)

# #읽어온 파일 출력
# print("<도서관에 있는 서적 리스트>")
# for book in read_book:
    
#     print(book)

# print("도서 리스트 끝")

11
import pickle

# 책 조회 메서드
def search_book(file_path):
    with open(file_path, 'rb') as f:
        book_list = pickle.load(f)
        print("Load 완료")
    
   
    for i, book in enumerate(book_list, 1):
        print(f"{i}. {book}")

# 책 수정 메서드
def update_book(file_path, isbn_upd, new_title=None, new_author=None, new_pub=None, new_year=None):


    with open(file_path, 'rb') as f:
        book_list = pickle.load(f)
        print("Load 완료")

    
    is_updated = False 
    for book in book_list:
        
        if str(book.isbn) == isbn_upd:
           
            if new_title is not None:
                book.title = new_title
            if new_author is not None:
                book.author = new_author
            if new_pub is not None:
                book.pub = new_pub
            if new_year is not None:
                book.year = new_year
            
            is_updated = True
            break 

    with open(file_path, 'wb') as f:
        pickle.dump(book_list, f)
        print("Write 완료")

    if is_updated:
        print(f"ISBN {isbn_upd} 책이 수정되었습니다.")

## 3. 책 삭제 메서드
def delete_book(file_path, isbn_del):
    with open(file_path, 'rb') as f:
        book_list = pickle.load(f)
        print("Load 완료")


    # 삭제할 책을 제외한 나머지 책들만 담을 새로운 리스트를 생성
    new_book_list = [book for book in book_list if str(book.isbn) != isbn_del]
    
    with open(file_path, 'wb') as f:
        pickle.dump(new_book_list, f)
        print("Write 완료")

    # 삭제 성공 여부를 원래 리스트와 새 리스트의 길이 비교로 확인
    if len(book_list) != len(new_book_list):
        print(f"ISBN {isbn_del} 책이 삭제되었습니다.")

file_path = 'book1.info'

# 책 수정
update_book(file_path, '9791185553948', new_title='고도를 기다리며')
# 책 삭제
delete_book(file_path, '9791156645023')
# 책 조회
search_book(file_path)