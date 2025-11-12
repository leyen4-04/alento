# 1.
    fname ='coord'

# 2.ccc
class class_Co_Mul:
    def __init__(slef,num1,num2):
         slef.num1 = num1
         slef.num2 = num2
         
    def lcm (self):
         start = max(self.num1, self.num2)

         end = (self.num1 * self.num2) + 1

         for i in range(start,end):
              if i % self.num1 ==0 and i % self.num2 == 0:
                   return i
              
num1, num2 = map(int, input("자연수인 두 수를 입력하세요: ").split())

calculator = class_Co_Mul(num1, num2)

result_lcm = calculator.lcm()

print(f"최소공배수 : {result_lcm}")


# 3.


# 4
# with open("foo.txt","w")as f:
#      f.write("가가가/n")
#      f.write("나나나/n")
#      f.write("다다다/n")

# with open("foo.txt",'a')as f:
#      f.write("This will be appended/n")
#      f.write("this too.")
     
# print("파일에 내용이 성공적으로 추가되었습니다")

5

6
import os

original_file = input("복사할 파일을 입력하세요. : ")

try:
   
    name, ext = os.path.splitext(original_file)
   
    copied_file = f"{name}_copy{ext}"

   
    with open(original_file, 'rb') as f_in, open(copied_file, 'wb') as f_out:
       
        f_out.write(f_in.read())

   
    print(f"'{copied_file}'을 생성했습니다.")
    print("file access successful? True")

except FileNotFoundError:
   
    print(f"Could not read file: '{original_file}'")
    print("file access successful? False")