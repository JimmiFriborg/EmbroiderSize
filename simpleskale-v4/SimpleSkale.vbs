' SimpleSkale 4.0 - GUI Launcher
' Version: 1.0.0
' This provides a user-friendly way to launch SimpleSkale

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Check if run.bat exists
strRunBat = strScriptPath & "\run.bat"
If Not objFSO.FileExists(strRunBat) Then
    MsgBox "Error: run.bat not found!" & vbCrLf & vbCrLf & _
           "Please make sure you're running this from the simpleskale-v4 folder.", _
           vbCritical, "SimpleSkale - Error"
    WScript.Quit 1
End If

' Show starting message
MsgBox "SimpleSkale 4.0 is starting!" & vbCrLf & vbCrLf & _
       "What happens next:" & vbCrLf & _
       "1. A console window will open" & vbCrLf & _
       "2. SimpleSkale will check for issues" & vbCrLf & _
       "3. Any problems will be fixed automatically" & vbCrLf & _
       "4. The SimpleSkale window will open (2-5 min)" & vbCrLf & vbCrLf & _
       "Please keep the console window open!", _
       vbInformation, "SimpleSkale 4.0"

' Change to the script directory and run run.bat
objShell.CurrentDirectory = strScriptPath
objShell.Run "run.bat", 1, False

' Show a helpful message
WScript.Sleep 1000
MsgBox "SimpleSkale is now starting in the console window." & vbCrLf & vbCrLf & _
       "The app window will open when ready!" & vbCrLf & vbCrLf & _
       "First-time startup takes 2-5 minutes." & vbCrLf & _
       "Please be patient!" & vbCrLf & vbCrLf & _
       "Keep the console window open while using SimpleSkale.", _
       vbInformation, "SimpleSkale 4.0 - Please Wait"
