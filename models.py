'''
Description: 
Autor: ShenHao
Date: 2021-04-19 13:45:33
LastEditors: ShenHao
LastEditTime: 2021-04-19 14:08:05
'''
import time, uuid

from orm import Model,TextField,FloatField,StringField,BooleanField,IntegerField

def next_id():
    return '%015d%s000' % (int(time.time() * 1000), uuid.uuid4().hex)#这个是真的看不懂 续：uuid--通用识别码

class User(Model):
    __table__='users'#表名为users

    #接下来开始定义列
    id=StringField(primary_key=True,default=next_id(),ddl='varchar(50)')#这里的default能确保id的唯一性
    email=StringField(ddl='varchar(50)')
    passwd=StringField(ddl='varchar(50)')
    name=StringField(ddl='varchar(50)')
    image=StringField(ddl='varchar(500)')#这是头像吗？为什么要用varchar来存储,存储成网址？
    created_at=FloatField(default=time.time)

class Room(Model):
    __table__='rooms'

    id=StringField(primary_key=True,default=next_id(),ddl='varchar(50)')
    owner_id=StringField('varchar(50)')
    name=StringField('varchar(50)')#name和user_name有什么区别呢
    passwd=StringField('varchar(50)') 
    participants=StringField('varchar(500)') 
    number=IntegerField()
