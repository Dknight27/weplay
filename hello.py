'''
Description: 
Autor: ShenHao
Date: 2021-04-11 10:22:33
LastEditors: ShenHao
LastEditTime: 2021-04-11 10:51:06
'''
from flask import Flask,render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('index.html');