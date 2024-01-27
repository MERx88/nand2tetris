// 프로그램 Mult.asm
// 계산 : RAM[2]=RAM[0]*RAM[1]

//RAM[0]

    @i
    M=1
    @sum
    M=0
(LOOP)
    @i
    D=M
    @R1                                                                       
    D=D-M
    @STOP
    D;JGT
    @sum
    D=M
    @R0
    D=D+M
    @sum
    M=D
    @i
    M=M+1
    @LOOP
    0;JMP
(STOP)
    @sum
    D=M
    @R2
    M=D
(END)
    @END
    0;JMP
