const familyTreeSource = `# timelineId suffixes that link the timeline to the tree - important: when pasting the value in the timeline extra info, replace
# backslash with %2F to encode, for example root timeline is 2138285/2648138406/ needs to appear as 2138285%2F2648138406%2F in the 
# link in the tiki-toki exotra info link, e.g. 
# to return to root [click here](http://127.0.0.1:5500/redirect%20to%20story%20example.html?newtimeline=2138285%2F2648138406%2F)
# to return to root [click here](http://127.0.0.1:5500/index.html?newtimeline=2138285%2F2648138406%2F)
# Other addresses:
# Ida 
# Harry             http://127.0.0.1:5500/index.html?newtimeline=2141911/5281753800/
# Jacob             http://127.0.0.1:5500/index.html?newtimeline=2139216/5281753800/
# Below are the data used to populate the tree struction
# data columns: Id/Key_Name, parent Id, display content, tooltip, timeline id, panel hash (leave empty for first panel)
####### root (Louis)
LOU_TRA,,Louis "Yuda Lieb" and Freida Trabin,tool tip,2138285/2648138406/,,{'menu': 'Trabin Family'; 'access': 'open'; 'seq': 1; 'level': 1}
####### Sam
SAM_TRA,LOU_TRA,Shrul Sam "Israel" and Celia ?? Trabin,,2141912/5281753800/,,{'menu': 'Sam Trabin Family'; 'access': 'gated'; 'seq': 20; 'level': 2}
NC1_TRA,SAM_TRA,No recorded children,,,
####### Ida and descendents
IDA_TRA,LOU_TRA,Ida (Trabin) and Chaim Kilberg,,2141914/5281753800/,,{'menu': 'Ida (Trabin) Kilberg Family'; 'access': 'gated'; 'seq': 30; 'level': 2}
ALB_KIL,IDA_TRA,Al and Selma Kilberg,,,
JAN_KIL,ALB_KIL,Jane Kilberg,,,
TOM_KIL,ALB_KIL,Tom Kilberg,,,
JIM_KIL,ALB_KIL,Jim Kilberg,,,
ETH_KIL,IDA_TRA,Ethel and Abe Schwartz,,,
LIN_SCH,ETH_KIL,Linda (Schwartz) and Alan Hershman,,,
ELA_HER,LIN_SCH,Elan Hershman,,,
DIN_HER,LIN_SCH,Dina Hershman,,,
KAR_SCH,ETH_KIL,Karen (Schwartz) and Louis Ojeda,,,
ELI_OJA,KAR_SCH,Elisa Ojeda,,,
AMA_OJA,KAR_SCH,Amanda Ojeda,,,
NAT_KIL,IDA_TRA,Nathan Kilberg,,,
####### Harry and descendents
HAR_TRA,LOU_TRA,Gershon "Harry" and Henrietta (Surman) Trabin ,,2141911/5281753800/,,{'menu': 'Harry Trabin Family'; 'access': 'gated'; 'seq': 30; 'level': 2}
####### Bernie and descendents
BER_TRA,HAR_TRA,Bernard and Frances (Latzer) Trabin,,,
TOM_TRA,BER_TRA,Tom Trabin and Nancy Rakela,,,
JER_TRA,BER_TRA,Jeri (Trabin) Baker,,,
CEL_BAK,JER_TRA,Celia Baker,,,
RBT_TRA,BER_TRA,Robert "Rob" Trabin,,,
####### Millie and descendents
MIL_TRA,HAR_TRA,Millie (Trabin) Henkin Swern ,,,
BRU_HEN,MIL_TRA,Bruce Henkin and Cynthia Hollos,,,
JOA_HEN,BRU_HEN,Joanna Henkin,,,
RIC_HEN,MIL_TRA,Rick Henkin and Marlena Mauser,,,
JES_HEN,RIC_HEN,Jesse (Henkin) and  Jake Lippman,,,
VIO_LIP,JES_HEN,Violet Lippman,,,
ALI_LIP,JES_HEN,Alice Lippman,,,
####### Ed and descendents
EDW_TRA,HAR_TRA,Ed and Tovia (Friedman) Trabin,,,
DAL_TRA,EDW_TRA,Dale (Trabin) and Marty Waschitz,,,
FAT_TRA,EDW_TRA,Faith (Trabin) and Jeff Osheroff,,,
EVE_OSH,FAT_TRA,Evan Osheroff<b/><div style='font-style:italic; font-size:small; font-weight: 400;'> m: Niharika Bandi,,
VIH_OSH,EVE_OSH,Vihaan Osheroff,,,
SCO_OSH,FAT_TRA,Scott Osheroff,,,
AND_TRA,EDW_TRA,Andrew "Andy" Jay Trabin,,,
####### Jacob and descendents
JAC_TRA,LOU_TRA,Jankel "Jacob" and Sadie (Weiss),,2139216/5281753800/,,{'menu': 'Jacob Trabin Family'; 'access': 'open'; 'seq': 40; 'level': 2}
CAR_TRA,JAC_TRA,Carl and Laura (Schacter) Trabin,,2139607/5812857090/,,{'menu': 'Carl Trabin Family'; 'access': 'open'; 'seq': 41; 'level': 3}
SAN_TRA,CAR_TRA,Sandi (Trabin) Advocat<b/><div style='font-style:italic; font-size:small; font-weight: 400;'> m/div: Steve Advocat,,2139607/5812857090/#vars!panel=19750573!
ROB_ADV,SAN_TRA,Robin (Advocat) Mancol<b/><div style='font-style:italic; font-size:small; font-weight: 400;'> m: Matt Mancol,,,
HAN_ADV,ROB_ADV,Hannah Advocat,,,
MOL_ADV,ROB_ADV,Molly Advocat,,,
BEN_ADV,SAN_TRA,Benn Advocat,,,
JAK_TRA,CAR_TRA,Jack and Nancy Trabin<div style='font-style:italic; font-size:small; font-weight: 400;'> div: Nancy Bechtel<div style='font-style:italic; font-size:small; font-weight: 400;'> m: Cindi Venier,,2139607/5812857090/#vars!panel=19750572!
JEN_TRA,JAK_TRA,Jennifer (Trabin) Black<div style='font-style:italic; font-size:small; font-weight: 400;'> m: Jeremy Black,,,
SHI_BLA,JEN_TRA,Shira Black,,,
MIL_BLA,JEN_TRA,Talia Black,,,
ELA_BLA,JEN_TRA,Eliana Black,,,
DEB_TRA,JAK_TRA,Deb Trabin,,,
REU_TRA,CAR_TRA,Robert "Reuven" and Bracha (Sabanek) Trabin,,2139607/5812857090/#vars!panel=19740093!
EIT_TRA,REU_TRA,Eitan Trabin<b/><div style='font-style:italic; font-size:small; font-weight: 400;'> m/div: Natalie Stern,,,
MIR_TRA,EIT_TRA,Mirko Trabin,,,
MLN_TRA,EIT_TRA,Milan Trabin,,,
MIS_TRA,EIT_TRA,Mischa Trabin,,,
MAY_TRA,REU_TRA,Maya Trabin and Trenton DuVal,,,
NAV_DUV,MAY_TRA,Nava DuVal,,,
AYL_DUV,MAY_TRA,Ayla Duval,,,
DON_TRA,REU_TRA,Donna (Trabin) Avidan<b/><div style='font-style:italic; font-size:small; font-weight: 400;'> m/div: Idan Avidan,,,
YAN_AVI,DON_TRA,Yanai Avidan,,,
ELI_AVI,DON_TRA,Eliya Avidan,,,
SYD_TRA,JAC_TRA,Sydney and Ruth (Zaresky) Trabin,,,
JAY_TRA,SYD_TRA,Jay and Sherri (??) Trabin,,,
DAN_TRA,JAY_TRA,Danielle Trabin,,,
JOS_TRA,JAY_TRA,Josh Trabin,,,
ERI_TRA,JAY_TRA,Eric Trabin,,,
RON_TRA,SYD_TRA,Ron And Janice (??) Trabin,,,
RNG_TRA,RON_TRA,Ron (?) Trabin,,,
BEN_TRA,RON_TRA,Benjamin Trabin,,,
HEL_TRA,JAC_TRA,Helene (Trabin) and Daniel Berne,,2141156/0328610175/,,{'menu': 'Helene (Trabin) Berne Family'; 'access': 'gated'; 'seq': 42; 'level': 3}
DOU_BER,HEL_TRA,Doug and Cheryl Berne,,,
CAN_BER,DOU_BER,Candace Berne,,,
LIA+BER,DOU_BER,Lianne Berne,,,
JAM_BER,HEL_TRA,James Berne,,,
####### Jenny and descendents
SHE_TRA,LOU_TRA,Sheindel "Jenny" (Trabin) and Samuel Herlich,,2141915/5281753800/,,{'menu': 'Jenny (Trabin) Herlich Family'; 'access': 'gated'; 'seq': 50; 'level': 2}
RUT_HER,SHE_TRA,Ruth (Herlich) and Marty Titleman,,,
MAR_TIT,RUT_HER,Richard Herlich,,,
CHI_TIT,RUT_HER,?? Herlich,,,
EST_HER,SHE_TRA,Ester (Herlich) Beifel Lazar,,,
STE_BEI,EST_HER,Steve Beifel,,,
BAR_BEI,EST_HER,Barbara Beifel,,,
####### Simon and descendents
SHI_TRA,LOU_TRA,Simon "Shimon" and Esther (Kaufman) Trabin,,2147311/5281753800/,,{'menu': 'Simon Trabin Family'; 'access': 'gated'; 'seq': 60; 'level': 2}
DEL_PIL,SHI_TRA,Delores (Trabin) and Ronald Pillet,,,
AND_MAD,DEL_PIL,Andrea (Pillet) and Michael Madden,,,
STA_PIL,DEL_PIL,Stacey Pillet,,,
JRM_PIL,SHI_TRA,Jerome "Jack" and Theodora (Rosenblatt) Trabin,,,
####### Phillip and descendents
PHI_TRA,LOU_TRA,Phillip and Mary (Chef?) Trabin,,2141910/5281753800/,,{'menu': 'Philip Trabin Family'; 'access': 'gated'; 'seq': 70; 'level': 2}
COR_BAC,PHI_TRA,Corinne and Francis Baca,,,
MIC_BAC,COR_BAC,Michael and Joyce (?) Baca,,,
CH1_BAC,MIC_BAC,Baca grandchild 1,,,
GAR_BAC,COR_BAC,Gary and Linda (?) Baca,,,
CH2_BAC,GAR_BAC,Baca grandchild 2,,,
SEY_TRA,PHI_TRA,Seymore and Joy (Doline) Trabin,,,
BET_SUC,SEY_TRA,Beth (Trabin) and Robert Suckiel,,,
JOS_SUC,BET_SUC,Joshua Suckiel,,,
LIS_SUC,SEY_TRA,Lisa (Suckiel) and Peter Ockerman,,,
IAN_OCK,LIS_SUC,Ian Ockerman,,,
RAC_OCK,LIS_SUC,Rachel Ockerman,,,
####### Fanny and descendents
FAN_TRA,LOU_TRA,Feige "Fanny" (Trabin) and Harry Barnow,,2147312/5281753800/,,{'menu': 'Fanny (Trabin) Barnow Family'; 'access': 'gated'; 'seq': 80; 'level': 2}
EST_BAR,FAN_TRA,Estelle (Barnow) Katz,,,
BY1_KAT,EST_BAR,Boy 1,,,
BY2_KAT,EST_BAR,Boy 2,,,
`
