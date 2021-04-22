'''
Description: 
Autor: ShenHao
Date: 2021-04-11 10:22:33
LastEditors: ShenHao
LastEditTime: 2021-04-20 14:23:54
'''
from flask import Flask,render_template,request
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('temp.html');
    
@app.route('/signin',methods = ["POST","GET"])
def siginin():
    if request.method == "GET" :
        return render_template('signin.html');

@app.route('/register')
def register():
    return render_template('register.html');