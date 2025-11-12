# 1.(3)
#     open("test.txt","a") 여기서 a는 기존 파일에 이어 쓰는 의미이므로 3번이다
#     읽기 전용은 a가 아닌 r이고, 쓰기 전용은 w이다 , 이진모드는 b이다
    
# 2.(3)
#      with 문은 파일을 열고 사용한 뒤, 코드 블록이 끝나면 파일을 자동으로 닫아주는 역할을 한다

# 3.(2)
    #  open("data.txt","r")함수는 data.txt 파일을 읽기 모드로 열고, 그 결과로 파일 객체를 반환한다. 
    # as f 부분은 이 반환된 파일 객체를 f라는 변수에 할당하는 역할을 한다.
# 4.(3)
    # 파일 전체 내용을 리스트로 읽어오는 함수는  --> readlines() 함수 
    # read() : 파일 전체의 내용을 하나의 문자열로 읽어온다    
    # readline() : 파일의 내용을 한 줄만 문자열로 읽어온다
    # readlines() : 파일의 모든 줄을 읽어와서, 각 줄을 하나의 요소로 갖는 리스트로 반환한다.

# 5.(3)
   
    # write()메서드는 문자열만 받을 수 있기에 문자열이 아닌 정수를 쓴다면 TypeError 발생한다.
# 6.(2)
    # 파일을 열 떄 기본모드는 읽기모드 이다. open()함수를 사용할 때, 인자인 모드를 생략하면 파이썬은 기본값 읽기모드로 적용한다
# 7.(2)
    #  with문을 사용하는 이유 중 올바른 것은 자동으로 파일 닫기 처리이다. 득 자동을 관리를 해 주므로 중간에 오류가 발생핻 파일을 안전하게 닫는다
# 8.(1)
    # with 문 안에서 파일을 열었을 때 코드 블록이 끝나면 파일이 자동으로 닫힌다
    # with은 마무리 작업을 자동으로 처리해 준다
# 9.(1)
#     flush() 함수는 남아있는 내용을 디스크에 쓰도록 강제하는 함수이다.따라서 파일을 닫지 않고 중간 내용을 디스크에 저장하고 싶을 떄 사용한다
#  오답
#     close 함수는 파일을 닫는 함수이다
#     sync함수는 디스크에 기록하라고 명령하는 함수이다
#     save함수는 데이터를 저장할때 사용한다


# 10
# import random 

# numbers = [ random.randint(1,100) for _ in range(10) ]
   

# with open('numbers.txt','w')as f:

#     str_numbers = map(str, numbers)
#     result_string = ' '.join(str_numbers)
#     f.write(result_string)


# # 11

# with open('numbers.txt', 'r') as f:
#     content = f.read()

# str_numbers = content.split() 
# numbers = [int(s) for s in str_numbers]
# total = sum(numbers)

# print(f"파일에 있는 숫자의 리스트 : {numbers}")
# print(f"숫자의 합은 {total}입니다.")




# 12

# with open('flower3.txt', 'a') as f:

    
#     while True:
       
#         flower_name = input("좋아하는 꽃이름을 입력하시오. : ")

       
#         if flower_name == "XXX":
#             break

       
#         if len(flower_name) >= 3:
            
#             f.write(flower_name + '\n')


# print("종료")

# 13.
# def encrypt(text, shift=5):
  
#     result = ""
#     for char in text:
#         if 'a' <= char <= 'z': # 문자가 소문자인 경우
#             start = ord('a')
#             # (현재 문자 위치 + 이동 칸 수) % 26 -> 순환 위치 계산
#             offset = (ord(char) - start + shift) % 26
#             result += chr(start + offset)
#         elif 'A' <= char <= 'Z': # 문자가 대문자인 경우
#             start = ord('A')
#             offset = (ord(char) - start + shift) % 26
#             result += chr(start + offset)
#         else: # 알파벳이 아닌 경우
#             result += char # 그대로 추가
#     return result

#     #암호화된 문자열을 복호화
# def decrypt(text, shift=5):
    
#     # 복호화는 암호화의 반대 과정, 즉 -5칸 이동하는 것과 같다.
#     return encrypt(text, -shift)

# #  사용자 입력 및 암호화 파일 저장 
# print("암호화할 영문 문자열을 입력하세요 (종료: 9999)")
# with open('pw.txt', 'w') as f:
#     while True:
#         user_input = input("영문 문자열을 입력하시오. : ")
#         if user_input == "9999":
#             break
        
#         encrypted_text = encrypt(user_input)
#         f.write(encrypted_text + '\n')

# print("입력 종료")


# print("\npw.txt을 읽어서 해독한 결과 출력")
# with open('pw.txt', 'r') as f:
#     for line in f:
#         # strip()을 사용하여 줄바꿈 문자를 제거합니다.
#         decrypted_text = decrypt(line.strip())
#         print(decrypted_text)
