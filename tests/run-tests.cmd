@ECHO ON

SETLOCAL

SET SCRIPT_DIR=%~dp0

SET DENO_DIR=%SCRIPT_DIR%..\package\dist\bin\
SET QUARTO_SRC_DIR=%SCRIPT_DIR%..\src\
SET IMPORT_MAP_ARG=--importmap=%QUARTO_SRC_DIR%\import_map.json

SET "QUARTO_BIN_PATH=%DENO_DIR%"
SET "QUARTO_SHARE_PATH=%QUARTO_SRC_DIR%resources\"
SET QUARTO_DEBUG=true
SET "QUARTO_DENO_OPTIONS=--unstable --allow-read --allow-write --allow-run --allow-env --allow-net"

REM Discover the location of RScript.exe
Setlocal ENABLEdelayedexpansion
For /F "Delims=" %%0 In ('where /r "c:\Program Files" Rscript.exe') do If "!RSCRIPT_PATH!"=="" SET "RSCRIPT_PATH=%%~0"

REM Restore the R environment
REM TODO This is currently failing building stringi (likely due)
REM to pinned version or other nonsense.
"%RSCRIPT_PATH%" -e "if (!requireNamespace('renv', quietly = TRUE)) install.packages('renv')"
"%RSCRIPT_PATH%" -e "renv::restore()"

REM TODO This is currently failing to restore the environment properly
REM Ensure that we've actived the python env
REM py -m pip install--upgrade pip
REM py -m pip install--upgrade virtualenv
REM py -m pip install --upgrade wheel
REM py -m pip install --upgrade Pillow
REM py -m virtualenv venv\bin\activate
REM py -m pip install -r requirements.txt -q

REM Ensure that tinytex is installed
call quarto tools install tinytex

REM Actually run the tests
%DENO_DIR%/deno test %QUARTO_DENO_OPTIONS% %IMPORT_MAP_ARG% %*

REM if %ERRORLEVEL% GEQ 1 EXIT /B 1

REM EXIT \B 0