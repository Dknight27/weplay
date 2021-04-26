from flask import render_template, redirect, url_for, abort, flash
from flask_login import login_required, current_user
from . import main
from .forms import EditProfileForm, EditProfileAdminForm, RoomForm, Close
from .. import db
from ..models import Role, User, Room
from ..decorators import admin_required


@main.route('/', methods=['GET', 'POST'])
def index():
    form=RoomForm()
    if form.validate_on_submit():
        if not current_user.is_authenticated:
            flash("请先登录")
            return redirect(url_for('.index'))
        if current_user.room_id :
            if current_user.room_id != int(form.rid.data):
                print(current_user.room_id, form.rid.data)
                flash("请先退出当前房间")
                return redirect(url_for('.index'))
            else:
                return redirect(url_for('.room', room_id=form.rid.data))
        else:
            if Room.query.filter(Room.rid==form.rid.data).first():#房间已经存在
                user=User.query.filter(User.id==current_user.id).first()
                user.room_id=form.rid.data
                db.session.add(user)
                db.session.commit()
                return redirect(url_for('.room', room_id=form.rid.data))
            else:
                room=Room(rid=form.rid.data, owner_id=current_user.id, owner_name=current_user.username)
                owner=User.query.filter(User.id==current_user.id).first()
                owner.room_id=room.rid
                db.session.add(owner)
                db.session.add(room)
                db.session.commit()
                return redirect(url_for('.room',room_id=form.rid.data))
    rooms=Room.query.all()
    return render_template('index.html', form=form, rooms=rooms)


@main.route('/user/<username>')
def user(username):
    user = User.query.filter_by(username=username).first_or_404()
    return render_template('user.html', user=user)


@main.route('/edit-profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm()
    if form.validate_on_submit():
        current_user.name = form.name.data
        current_user.location = form.location.data
        current_user.about_me = form.about_me.data
        db.session.add(current_user._get_current_object())
        db.session.commit()
        flash('Your profile has been updated.')
        return redirect(url_for('.user', username=current_user.username))
    form.name.data = current_user.name
    form.location.data = current_user.location
    form.about_me.data = current_user.about_me
    return render_template('edit_profile.html', form=form)


@main.route('/edit-profile/<int:id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_profile_admin(id):
    user = User.query.get_or_404(id)
    form = EditProfileAdminForm(user=user)
    if form.validate_on_submit():
        user.email = form.email.data
        user.username = form.username.data
        user.confirmed = form.confirmed.data
        user.role = Role.query.get(form.role.data)
        user.name = form.name.data
        user.location = form.location.data
        user.about_me = form.about_me.data
        db.session.add(user)
        db.session.commit()
        flash('The profile has been updated.')
        return redirect(url_for('.user', username=user.username))
    form.email.data = user.email
    form.username.data = user.username
    form.confirmed.data = user.confirmed
    form.role.data = user.role_id
    form.name.data = user.name
    form.location.data = user.location
    form.about_me.data = user.about_me
    return render_template('edit_profile.html', form=form, user=user)

@main.route('/rooms/<room_id>', methods=['GET','POST'])
@login_required
def room(room_id):
    form=Close()
    if form.validate_on_submit():
        u = User.query.filter(User.id == current_user.id).first()
        r = Room.query.filter(Room.rid == current_user.room_id).first()
        u.room_id = None
        if not r.users:
            db.session.delete(r);
        db.session.add(u)
        db.session.commit()
        return redirect(url_for('.index'))
    room=Room.query.filter(Room.rid==room_id).first()
    return render_template('room.html', room=room, users=room.users, form=form)

