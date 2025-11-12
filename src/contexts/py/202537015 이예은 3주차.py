# 1.답:(2) 
#     try-except함수는 오류가 발생가능성이 있는 코드를 try함수 안에 넣고
# 오륙 발생했을 때 처리 할 코드를 except함수 안에 넣어 예외처리를한다
#     catch와 throw는 파이썬 외 자바 c++에서 사용하는 예외처리 키워드다
#     handle-error는 파이썬 표준 예외처리키워드 아님

# 2.(1) : try 블록 안의 코드가 아무런 예외 없이 성공적으로 실행 되었을떄 
#     else 블록에 있는 코드가 실행된다

#     except는 예외가 발생했을때, finally는 항상 실행된다

# 3.(3) : finally절은 예외가 발생하든, 발생하지 않든 상관없이 try구문이 끝날때할상 실행된다

# 4.(1) : 숫자를 0으로 나누려고 할때 발생하는 에러이다 

# 5.(1) : 파일이 존재하지 않을 때  발생하는 예외는 FileNotFoundError 이다

# 6.(4) : finally 절이 없다면, 예외가 발생하면 어떻게 되는가?

#         finally의 유뮤는 예외 처리 자체의 흐름에 영향을 주지 않는다
#         예외를 처리할 수 있는 except 절이 있다면, except절이 실행되고 프로그램은 계속 된다
#         만액 처리할 except절이 없다면, 예외는 처리되지 않고 상위 코드 블록으로 전파되거나 최상위까지 처리되지 않으면 프로그램이 종료된다.
#         따라서 2,3 이 맞습니다

# 7.(2) : try -> except -> else -> finally 순으로 실행된다

# 8.(3) : 예외 처리를 하지 않으면 어떻게 되는가??
#         try - except 코드가 없다면 프로그램은 즉시 실행을 멈추게 되고,
#         어떤 오류가 발생했는지 상세한 정보를 화면에 출력한 뒤 종료된다

# 9.
#         nums = [1,2,3]
#         try:
#                 print(nums[5])
#         except IndexError:
#                 print("리스트 인덱스 범위를 벗어났습니다")

# nums 인덱스는 0,1,2 까지만 존재한다 그런데 print(nums[5])는 리스트의 범위를 벗어나는 5번 인덱스이므로 
# 인덱스 오류가 발생한다.
        

# 10.
#         try:
#                 num = int("abc")
#         except ValueError:
#                 print("정수로 변한할 수 없는 값입니다")
#         int() 함수는 문자열을 정수형 숫자로 변환하는데, "abc"와 같이 숫자로변할 수 없는 값이므로 오류가 뜬다 

# 11.
#         try: 
#                 x = int("abc")
#                 y = "hello" + 5
#         except(ValueError,TypeError)as e:
#                 print("예외발생:",e)
        
#         x 에서 int는 문자열을 숫자로 변하지만, "abc"라는 문자열은 숫자로 변할 수 없는 값으로 ValueError 가 발생
#         y 에서는 문자열과 숫자를 더할수 없기에 TypeError 오류가 발생한다

# 12.

# def get_first_element(lst):
#     if not lst:
#         raise IndexError("리스트가 비어 있습니다.")
#     else:
#         return lst[0]
                

# list1 = [10,20]
# try:
#     first_element = get_first_element(list1)
#     print(f"첫 요소 : {first_element}")
# except IndexError as e:
#     print(f"예외 발생: {e}")

# list2 =[]
# try:
#     first_element = get_first_element(list2)
#     print(f"첫 요소 : {first_element}")
# except IndexError as e:
    # print(f"예외 발생: {e}")


 # 1. 함수 정의
def get_first_element(lst):
    if not lst:
        # 리스트가 비어있으면 예외를 직접 발생시킴
        raise IndexError("리스트가 비어 있습니다.")
    # 비어있지 않으면 첫 요소를 반환
    return lst[0]

# --- 메인 코드 ---

# 2. 첫 번째 호출 (성공하는 경우)
try:
    result = get_first_element([10, 20])
    print(f"첫 요소: {result}")
except IndexError as e:
    print(f"예외 발생: {e}")

# 3. 두 번째 호출 (실패하는 경우)
try:
    result = get_first_element([])
    print(f"첫 요소: {result}")
except IndexError as e:
    # 함수에서 raise한 예외를 여기서 잡아서 처리함
    print(f"예외 발생: {e}")       
        
# 13.    

# input_data = input("숫자들을 공백으로 입력하세요: ")
# numbers_str = input_data.split() # 입력받은 문자열을 공백을 기준으로 나눔


# lst = [] 

# try:
    
#     for num_str in numbers_str:
#         lst.append(float(num_str))
            
   
#     total = sum(lst)
#     count = len(lst)

#     if count == 0:
#         print("입력된 숫자가 없습니다.")
#     else:
#         average = total / count
#         print(f"평균: {average:.2f}")

# except ValueError:
#     print("입력된 값이 숫자가 아닙니다")

                
                

   