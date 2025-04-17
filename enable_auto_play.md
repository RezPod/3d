To disable Chrome's autoplay policy on macOS, you can use the command-line flag --autoplay-policy=no-user-gesture-required when launching the browser. This will allow websites to autoplay media without requiring user interaction. However, it's important to note that this flag might not always persist across Chrome restarts or updates. [1, 2, 3, 4]  
Here's how to do it: [1, 2]  

1. Find the Chrome application: Locate the Google Chrome application in your Finder. 
2. Open in Terminal: Right-click on the Chrome icon and select "Open in Terminal". 
3. Run Chrome with the flag: Type the following command in the Terminal window and press Enter: 

    open -n -a "Google Chrome" --args --autoplay-policy=no-user-gesture-required

• open: This command opens the specified application. [1, 2]  
• -n: This option opens the application in a new instance. [1, 2]  
• -a "Google Chrome": This specifies the application to open (Google Chrome). [1, 2]  
• --args: This indicates that arguments will follow. [1, 2]  
• --autoplay-policy=no-user-gesture-required: This is the command-line flag that disables the autoplay policy. [1, 2]  

1. Verify the setting: Once Chrome is open, you can verify that autoplay is now allowed by visiting a website with autoplay enabled. [1, 2]  
2. Note: This setting will only apply to the specific instance of Chrome that is launched with the command-line flag. To make it a permanent change, you would need to modify the command that launches Chrome every time. [1, 2]  

Generative AI is experimental.

[1] https://support.flowics.com/en/articles/8870895-google-chrome-autoplay-policy[2] https://developer.chrome.com/blog/autoplay[3] https://stackoverflow.com/questions/67736638/chromium-video-autoplay-not-working-ignores-autoplay-policy-no-user-gesture-req[4] https://stackoverflow.com/questions/59113898/how-can-i-enable-autoplay-in-chrome
