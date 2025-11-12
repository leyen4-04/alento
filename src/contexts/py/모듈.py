# from datetime import datetime as dt

# today = dt.date.today()
# print(f'오늘은 {today.year}년 {today.month}월 {today.day}일 입니다')

# import time

# t = time.gmtime()
# print(t)

# 9번
# import time
# for i in range(1,11):
#     print(f'{i}초 경과')
#     time.sleep(1)
# print("프로그램 재시작")

#10
# 1. 1~100까지의 임의의 정수 10 개를 출력해야한다
#2. 뽑힌 10개의 정수는 중복이 되면 안된다
#3. 오름차순으로 출력되어야한다.

# import random 
# all_num = range(1,101)
# random_num = random.sample(all_num, 10)
# random_num.sort()
# print(f"임의의 정수 : {random_num}")

# 11
# import datetime
# date = input("YYYY-MM-DD 형식의 날짜를 입력하세요")
# part = date.split('-')
# year = int(part[0])
# month = int(part[1])
# day = int(part[2])

# input_date = datetime.date(year, month, day)
# today=datetime.datetime.now().date()
# gap = today - input_date
# print(f" 날씨의 차이: {gap.days}일")

# #12
# import sys
# if len(sys.argv) != 3:
#     print("두 개의 정수를 입력하세요")
#     sys.exit()

# try:
#     num1 = int(sys.argv[1])
#     num2 = int(sys.argv[2])

# except ValueError:
#     print("입력값이 정수가 아닙니다. 숫자만 입력해주세요")
#     sys.exit() 

# result = num1 + num2
# print(f"입력되 두수의 합은 {result}입니다")


# 13
# import random

# # 선수 데이터
# players = {'김동현':100, '정찬성':90, '최두호':120, '강경호':95, '권원일':110}

# # 1. 전체 선수 이름 리스트에서 4명을 무작위로 뽑기
# chosen_players = random.sample(list(players.keys()), 4)

# # 2. 2명씩 두 팀으로 나누기
# team1 = chosen_players[:2]
# team2 = chosen_players[2:]

# # 3. 각 팀의 파워 계산
# power1 = players[team1[0]] + players[team1[1]]
# power2 = players[team2[0]] + players[team2[1]]

# # 4. 결과 출력
# team1_names = ', '.join(team1)
# team2_names = ', '.join(team2)

# if power1 > power2:
#     print(f"{team1_names} 팀이 {team2_names} 팀을 이겼습니다!!")
# elif power2 > power1:
#     print(f"{team2_names} 팀이 {team1_names} 팀을 이겼습니다!!")
# else:
#     print("두 팀이 비겼습니다!!")


14.
import random
secret_number = random.randint(1, 100)
attempts = 0
while True:
    # 4. 사용자에게 숫자를 입력받습니다.
    inputNum = input("숫자를 입력하세요. : ")

    # 5. 시도 횟수를 1 증가시킵니다.
    attempts += 1

    # 6. isdigit()으로 입력값이 숫자인지 먼저 확인합니다.
    if  inputNum.isdigit():
        # 숫자가 맞으면, 안전하게 정수로 변환합니다.
        guess = int(inputNum)
    else:
        # 숫자가 아니면, 에러 메시지를 출력하고 다시 반복문의 처음으로 돌아갑니다.
        print("잘못된 입력입니다. 숫자만 입력해주세요!")
        continue

    # 7. 사용자의 추측과 정답을 비교하여 힌트를 줍니다.
    if guess > secret_number:
        print("입력한 숫자가 큽니다. DOWN!!")
    elif guess < secret_number:
        print("입력한 숫자가 작습니다. UP!!")
    else: # 정답을 맞춘 경우
        print("정답입니다. 축하합니다!! ^^")
        print(f"당신은 {attempts}번 만에 정답을 맞추셨습니다.")
        break