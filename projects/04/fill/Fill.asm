(KEY)
@SCREEN
D=A
@screenPixel
M=D
@KBD
D=M
@BLACK
D;JGT

(WHITE)
@screenPixel
A=M
M=0
@screenPixel
M=M+1
D=M
@24576
D=A-D
@WHITE
D;JGT
@KEY
0;JMP

(BLACK)
@screenPixel
A=M
M=-1
@screenPixel
M=M+1
D=M
@24576
D=A-D
@BLACK
D;JGT
@KEY
0;JMP


