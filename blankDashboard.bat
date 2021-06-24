@ECHO OFF
SET PATH=%PATH%;"F:\SUNIL\Documents\PARC Respirator\Arduino Board\Sandbox\dashboard\curl\bin"

SET SYSUID=RSP_28CFE43C4D200184

for /F "tokens=*" %%A in (blankJson.txt) do (
  echo %%A
  curl --request POST --header "Content-type: application/json" https://dweet.io/dweet/for/%SYSUID% --data "%%A" > NUL
  timeout 1 > NUL
) 

PAUSE

