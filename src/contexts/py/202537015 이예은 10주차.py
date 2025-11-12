# 1.(2) - ndim은 배열의 차원 객체 수를 알려준다
# shape는  배열의 형태 또는 구조룰 알려 준다. 
# size는 배열의 전체 원소 개수를 반환한다.
# dtype은 배열의 데이터 타입을 반환한다.

# 2(4)
# nupmy.identitity(n)함수는 항등행렬을 생성하므오 (n,n)형태의 2차원배열을 반환


#3.numpy.random.rand(2,3)은 무엇을 반환하는가?
# (2) 0~1 사이 실수형 난수2*3

# 4.
# 답:(1)그대로 유지

# 5.numpy.reshape(a, (2, 3))에서 주의할 점은?
# 답: 1번 - 반드시 원소의 수가 동의 해야한다
# reshape는 배열의 모양을 바꾸는 기능으로 총 개수를 유지되는 한에서만 작동

# 6.브로드캐스팅의 개념으로 옳은 것은?
# 답:2
# 작은 배열이 자동으로 확장되넝 연산에 참여한다

# 7. numpy.arange(9).reshape(3,3)[:,1] ??
# 답 (2)

# 8. 배열의 차원 수를 강제로 1차원으로 줄이는 함수는?
# 답(1)
# flatten() 함수는 다차원 배열을 무조건 1차원 배열로 쭉 펼쳐서(줄여서) 반환한다

# 9. numpy.linspace(0,1,5)의 올바른 결과??
# 답(1)

# 10
# import numpy as np

# a = np.arange(16).reshape(4, 4)

# a[1, :] = a[1, ::-1]
# a[3, :] = a[3, ::-1]

# print(a)

# 11.
# import numpy as np

# arr = np.random.randint(1, 201, size=(5, 5))
# print("Original:\n", arr)

# sorted_arr = np.sort(arr, axis=1)
# print("Sorted by row:\n", sorted_arr)

# 12
# import numpy as np

# a = np.random.randint(0, 101, size=(4, 5))
# print(" 최초 생성값:", a)


# max = a.max(axis=1)
# print("각 행의 최댓값:",max)

# min = a.min(axis=1)
# print("각 행의 최댓값:",min)


# result = max - min

# print("결과 값:", result)

# 13.
# import numpy as np

# a = np.random.randint(1, 101, 50)
# print("# 최초 생성:\n", a)

# b = a % 5
# print("# 5로 나눈 나머지:\n", b)

# c = b[b < 3]
# print("# 3보다 작은 나머지:\n", c)

# d = c[:9]

# e = d.reshape(3, 3)
# print("# 3x3 배열:\n", e)