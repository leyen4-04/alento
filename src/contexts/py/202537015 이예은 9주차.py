# 1. 다음 중 람다 함수의 특징으로 옳지 않는 것 ? 
# 답 :2번  
# 람다 함수느 단 하나의 표현식만 가질 수 있으며, 같은 명령문이나 여러 줄의 코드를 포함할 수 없다.


# 2.다음 중 리스트 내포를 이용해 [2,4,6,8]을 만드는 것은?? 
# 정답: 2,4
# 2번 =[x*2 for x in range(1,5)]: -> range(1,5)는 1,2,3,4입니다. 여기에 2를 곱하면 2,4,6,8 이된다.
# 4번 = [x for x in range(2,9,2)] -> range(2,9,2)는 2,4,6,8 로 성립한다


# 오답
# 1번 = [x+2 for x in range(4)] -> range(4)는 0,1,2,3 으로 여기에 2를 더하면 2,3,4,5가 된다
# 3번 = [x for x in [2,4,6,8]] -> 리스트를 그대로 복사기에 2,4,6,8이 된다

# 3. 다음 중 filter()함수에 대한 설명으로 올바른것은?
# 정답:2번, 조건식이 true인 요소만 걸러낸다.
# filter(function,iterable)함수는 iterable반복가능한객체의 각 요소를 functiondp 넣어서 실행하는 구조이다

# 오답 
# 1번- 모든 요소를 변환하여 반환하는건 map함수이다
# 3번- 리스트 내포보다 속도가 느리다 -> 리스트 내포가 filter와 람다 조합보다 빠르다
# 4번- 문자열에만 적용된다. -> 리스트, 튜플 세트 등 모든 iterable에 적용된다

# 4.map과 filter의 공통점으로 옳은 것은?
# 정답: 1번 둘다 반복 가능한 객체를 반환한다. map은 map객체를, filter는 filter객체를 반환한다
# 둘다 대용량 데이터를 효율적으로 처리하기 위해 설계되었디

# 오답
# 2. 둘다 리스트만이 아닌 튜플, 문자열등 모든 iterable(반복가능한 객체)을 인자로 받을수 있다
# 4. 둘 다 값을 즉시 계산한다. 즉시가 아닌 지연평가를 한다 즉 실제 값이 필요할 때까지 계산을 미룬다.


# 5. 다음 중 반복자(iterator)의 특징이 아닌 것은?
# 정답: 2번 -한번 순회 재사용이 가능하다.
# 반복자는 next()함수를 통해 다음 차례대로 꺼낼 수 있는 객체이다.

# 6.다음중 제너레이터를 생성하는 방법으로 옳은 것은?
# 정답 : 3번
# 제너레이터는 값이 필요할 떄마나 하나씩 생성해내는 객체를 생성 하므로 소괄호를 사용 하기에 정답이다

# 오답
# 1. 중괄호를 사용하는 것은 세트객체 이므로 틀렸다.
# 2번 대괄호는 리스트으로  틀렸다
# 4번은 파이썬에서 사용되는 올바른 문법이 아니다

# 7.제너레이터가 중단된 후 next()를 다시 호툴하면 어떤 예외가 발생하나?
# 정답 3번- stoplteration
# 제너레이터를 포함한 모든 이터레이터는 next()함수를 통해 다음 값을 가져온다
# 따라서 한번 더 next()호출 한다면  stoplteration 예외가 발생한다

# 8. 다음중 map과 제너레이터 표현식의 공통 점으로 올바른 것은 
# 정답 2번
# map함수는 리스트를 즉시 반환하지 않는다
# 제너레이터는 값이 요청 될때 다음 값을 반환한다.

# 9.다음 코드의 결과?
 
#  정답: 2번 4 

# num =[1,2,3,4]
# res = sum(x for x in num if x % 2)
# print(res)

10. 사용자로 부터 문자열을 입력 받아  모음(a,e,i,o,u)을 포함하는 단어만 소문자로 변환해 출력하시오

num = set(' aeiou') # 모음을 정의 한다

s = input("문자열을 입력하시오: ") # 사용로 부터 문자열을 입력받는다

words = s.split() # 문자열을 공백기준으로 쪼개어 단어 리스트를 만든다

result ={
    word.lower()
    for word in s.split() 

    if any(char.lower() in num for char in word)
}

print(result)



11.


result = [x for x in range(1, 51) if x % 2 != 0 and x * x < 200]
  
print(result)


12.


s = input("문자열을 입력하시오. : ")


result = [
    int(char) 
    for char in s  
    if char.isdigit() 
]


print("리스트", result)

13.

class ReverseIter:
   
    def __init__(self, data):
        self.data = data      
        self.index = len(data) 
 
   
    def __iter__(self):
        return self 
 
   
    def __next__(self):
        
        if self.index == 0:
            raise StopIteration
        
       
        self.index -= 1
        
        return self.data[self.index]

s = input("문자열을 입력하시오. : ")


rev_iter = ReverseIter(s)


print(" ".join(rev_iter))




14.

s = input("정수를 입력하시오. : ")


nums_iter = map(int, s.split())


gen = (
    num * num     
    for num in nums_iter 
    if num % 2 == 0 
)


print(tuple(gen))
