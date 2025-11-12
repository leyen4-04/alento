import sys
if len(sys.argv) != 3:
    print("두 개의 정수를 입력하세요")
    sys.exit()

if not(sys.aegv[1].isdigit() and sys.argv[2].isdigit()):
    print("입력값이 정수가 아닙니다. 숫자민 압력해주세요")
    sys.exit()
    
num1 = int(sys.argv[1]) 
num2 = int(sys.argv[2])
result = num1 + num2
print(f"입력되 두수의 합은 {result}입니다")
