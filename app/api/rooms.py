from flask import jsonify, request, current_app, url_for
from . import api
from ..models import Room

@api.route('/rooms/<int:rid>')
def get_room(rid):
    room=Room.query.filter(Room.rid==rid).first()
    return jsonify(room.to_json())