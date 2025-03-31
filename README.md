# Fine-Tuning in Large Language Models For Bug Detection and Fixing For Python Code

## Overview
This repository hosts theproject dedicated to Fine-Tuning in Large Language Models For Bug Detection and Fixing in Python. The project utilizes a custom dataset and innovative methods to enhance the LLM's capabilities in understanding and correcting code errors. Here are the topics in this project:
- [From Idea to Reality: Developing Krishna Python Bug Detection & Fixing](#from-idea-to-reality)
- [Dataset Description](#dataset-description)
- [Dataset Creation Process](#dataset-creation-process)
- [Model Description](#model-description)
- [Fine-Tuning](#fine-tuning)
- [Krishna Python Bug Detection & Fixing – VS Code Extension](#VSCode-extension)
- [Conclusion](#conclusion)
- [User Interface](#user-interface)
- [How to Use](#how-to-use)

## From Idea to Reality: Developing Krishna Python Bug Detection & Fixing

## **The Beginning: A Challenge Unfolds**

It all started when I received a problem statement: **develop an AI-powered tool for Python bug detection and fixing.** At first, I had no idea how to train an AI model, let alone deploy it as a functional tool. With a mix of excitement and uncertainty, I reached out to my college's incubation cell for guidance.

One of my friends from the incubation cell suggested a beginner-friendly YouTube video ([watch here](https://youtu.be/Gpyukc6c0w8?si=lmsDgF_E94mOyy28)) that introduced me to the basics of training models. At the same time, my mentor advised me to explore **Hugging Face**, a platform for machine learning models, and suggested looking at codebases of similar projects. This set the foundation for my journey into AI model training.

---
## **Navigating the Unknown: First Steps in AI Training**

After watching the video and studying existing codebases, I reached the next challenge—**where and how to train the model.** I consulted my friend again, who introduced me to **Google Colab**, a cloud-based platform for training AI models. This was a turning point, but my struggle was far from over.

While training the model, I encountered multiple errors. I spent two frustrating days troubleshooting without success. Then, I stumbled upon **Claude AI**, which miraculously solved my issue in just **five minutes**. This experience taught me the importance of using AI tools to accelerate debugging and problem-solving.

During this time, I also learned about the **LoRA (Low-Rank Adaptation) technique**, which allows for efficient fine-tuning of large language models. My mentor introduced me to **Unsloth**, a framework that speeds up model training, and I also discovered **quantization**, a technique that reduces model size without significant loss of performance.

Additionally, during the **first live session with our industry mentor, Tarun Sir**, we learned how to create datasets from open-source repositories. This led my teammate and me to start collecting **Python code** from open-source repositories, while sometimes using GPT-generated code.

---
## **Dataset Preparation: Introducing Mutations**

With a clear goal to train the model for **Python bug detection and fixing**, we meticulously curated our dataset. Since the model needed to differentiate between correct and incorrect code, we **introduced artificial bugs** into the original code using **mutation techniques**. This step was crucial in ensuring the model learned to detect and rectify common coding errors.

However, an unexpected challenge arose: **which model should we train?** During our **second live session with the industry mentor**, we were advised to choose any model that suited our needs. Initially, we attempted to fine-tune **DeepSeek-Coder-V2-Lite-Instruct**, but it wasn't supported by Unsloth. Since we had already experimented with **Llama models** in our earlier learning phase, we naturally pivoted to **CodeLlama** for our final training.

---
## **Bringing the Model to Life: Training & Testing**

After training the model, we needed to test its effectiveness. To do this, we had to convert the model into **GGUF format** to make it compatible with local execution. A friend from the incubation cell suggested using **Ollama** to run the model locally.

At first, I was confused because Ollama wasn't opening. After spending three hours troubleshooting, I reached out to the same friend again, who casually mentioned, _"It won't open as a window; it runs in the background. Check the hidden icons next to the time and date."_ This was another valuable lesson in problem-solving through collaboration.

Once we successfully ran the model, we tested it by feeding buggy Python code. The model **produced correct fixes, but with an unexpected issue—it generated the corrected code again and again until EOS(End Of Sequence) length is satisfied!** This became our next major hurdle.

---
## **Deploying as a VS Code Extension**

With the model trained and functional (aside from the infinite loop issue), I decided to package it as a **VS Code extension**. To achieve this, I relied on two YouTube tutorials:
- **How to Build a VS Code Extension** ([watch here](https://youtu.be/clJCDHml2cA?si=E1wQMgJXC5hUs0Hf))
- **How to Publish a VS Code Extension** ([watch here](https://youtu.be/pj3uetwbo00?si=CUn0zaERzWear4Bl))

Following these guides, I successfully launched the **Krishna Python Bug Detection & Fixing** extension on the VS Code Marketplace. However, the **generated the corrected code again and again until EOS(End Of Sequence) length is satisfied!** remains unresolved, and I am actively looking for solutions.

---
## **Lessons Learned & Future Improvements**

Through this project, I realized that **reaching out to people and leveraging community knowledge is key to overcoming technical hurdles**. Every major breakthrough—be it discovering **Hugging Face, Google Colab, Unsloth, LoRA, or Ollama**—came from mentorship and collaboration.

As for the **next steps**, my top priority is fixing the **infinite response loop** issue. Though I don’t have a solution yet, I plan to reach out to experts and continue refining the model.

---
## **Final Thoughts: Join the Journey!**

The **Krishna Python Bug Detection & Fixing** extension is now live! 🚀 You can search for it on **VS Code Marketplace**, install it, and give it a try. If anyone has experience with handling infinite response loops in AI models, feel free to reach out to me:

📧 **Email:** krishnachoudhary4616@gmail.com  
🔗 **LinkedIn:** [Krishna Choudhary](https://www.linkedin.com/in/choudharykrishna40/)

This is just the beginning. The journey of improving this extension continues, and I look forward to learning and growing with the developer community! 💡✨




## Dataset Description
The dataset, named `krish-bug-detect-fix`, is meticulously crafted to train and test LLMs specifically for bug detection and correction tasks. It comprises 25,793 rows, each containing:
- `original_code`: The buggy code snippet.
- `modified_code`: The corrected code snippet.
- `changed_line`: The specific line in the code where the bug was fixed.
- `number_of_line`: The line number of the corrected code.
- `mutation_type`: Type of bug introduced; includes Operation, Decision, Value, and Statement mutations.

This dataset was generated using Mutation Testing techniques to systematically introduce bugs into existing clean code. The types of mutations are designed to simulate common logical and syntactic errors developers might encounter.

<p align="center">
    <img src="Images/Dataset_schema.jpg" width=600>
    <img src="Images/mutation_distributaions.jpg" width=400>
</p>

## Dataset Creation Process
The dataset was curated through a semi-automated process:
1. **Code Extraction**: Clean code snippets were extracted from open-source repositories.
2. **Mutation Injection**: Bugs were introduced into the clean code using predefined mutation rules to alter specific parts of the code logically.
3. **Data Compilation**: Each entry in the dataset includes the bugged code, the fix, the location of the fix, and the type of mutation, prepared for LLM training and evaluation.

## Model Description
The backbone of our fine-tuning experiments is the [Unsloth CodeLlama-7B-BnB-4bit](https://huggingface.co/unsloth/codellama-7b-bnb-4bit) model, an optimized variant of Meta's CodeLlama designed for efficient natural language and code-related tasks. Leveraging 4-bit quantization via BitsAndBytes (BnB), this model balances performance and memory efficiency, making it well-suited for code generation, debugging, and software development automation. Its architecture enables rapid adaptation to various programming languages, enhancing its ability to assist in complex software engineering workflows.

## Fine-Tuning
In this project, fine-tuning is aimed at adapting the model to the coding domain, especially for bug detection and debugging. The model is trained on a dataset of code with errors and corresponding corrections, allowing it to learn patterns for identifying and fixing programming issues. The LoRA method is employed to efficiently adjust the model's weights, optimizing the fine-tuning process by reducing computational demand. This process enhances the model's ability to accurately detect and resolve bugs, ensuring it can provide effective code debugging suggestions while still generalizing well to other tasks. Fine-tuning, combined with LoRA, ensures that the model can handle the specific challenges of bug detection in programming with minimal resource requirements.

<p align="center">
    <img src="Images/LoRA.jpg" width=400>
    <img src="Images/LoRA_training.jpg" width=500>
</p>

## Krishna Python Bug Detection & Fixing – VS Code Extension

## Overview
Boost your Python development with an intelligent bug detection and debugging assistant! **Krishna Python Bug Detection & Fixing** is a powerful VS Code extension designed to identify and resolve errors in Python code effortlessly. Leveraging a fine-tuned AI model specifically trained on Python debugging, this extension streamlines your development workflow, making error resolution faster and more intuitive.

## Features
- ✅ **Automatic Bug Detection** – Instantly detects syntax and logical errors in Python code.
- ✅ **AI-Powered Debugging** – Provides smart suggestions to fix common issues.
- ✅ **Seamless Integration** – Works directly within VS Code for a smooth coding experience.
- ✅ **Code Optimization** – Suggests improvements for cleaner and more efficient code.
- ✅ **User-Friendly Interface** – Highlights errors and fixes in real-time.

## Installation
1. Open **VS Code**.
2. Go to **Extensions** (`Ctrl + Shift + X`).
3. Search for **"Krishna Python Bug Detection & Fixing"**.
4. Click **Install**.
5. Restart VS Code if needed.

## Usage
1. Open a Python file in VS Code.
2. The extension will automatically analyze the code.
3. Errors and suggestions will be displayed in the **Problems** tab.
4. Apply the suggested fixes or refine the code based on AI recommendations.

## Known Issue: Infinite Loop on Buggy Code
Currently, the extension may enter an **infinite response loop** when processing certain buggy code. This issue is under investigation, and we are working on a fix. In the meantime, if you encounter this issue:
- Try stopping the execution manually (`Ctrl + C` or restarting VS Code).
- Modify the input to be more structured before running the extension.

## Upcoming Improvements
- 🔹 Fix for the infinite loop issue(Introduce a Timeout Mechanism,Implement a Debugging Confidence Score).
- 🔹 Enhanced AI model with better debugging capabilities.
- 🔹 More detailed explanations for code fixes.

## Conclusion
Fine-tuning the CodeLlama model enhances its ability to understand, generate, and debug Python code more accurately. By training it on domain-specific datasets, we improve its efficiency in identifying errors and providing precise fixes, making it a powerful tool for automated code analysis.

## User Interface

This user interface is designed for the "Krishna AI-powered Python Debugger" tool. It features a clean, minimalist layout with a multi-line text area where users can input their Python code or describe coding issues. Users interact with the extension via the prominent "ASK" button to submit queries, and the "Reset Conversation" button to start fresh debugging sessions. The response area displays AI-generated solutions with syntax highlighting for code snippets, while a convenient copy button allows users to easily transfer fixes to their codebase. The UI is optimized for VSCode integration, providing developers with contextual debugging assistance without disrupting their workflow.

<p align="center">
    <img src="Images/UI.png" width=400>
    <img src="Images/vs-img1.png" width=500>
</p>

## How to Use
To use the Krishna AI-powered Python Debugger extension, simply open the extension panel in VSCode, paste your problematic Python code or describe your issue in the text area, and click the "ASK" button to receive AI-generated debugging suggestions and fixes. Copy the solution directly to your clipboard with the copy button, or reset the conversation to start a new debugging session when needed.
