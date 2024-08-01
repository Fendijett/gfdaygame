from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, disconnect

app = Flask(__name__)
socketio = SocketIO(app)

rooms = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = "23"  # Hardcoded room code
    join_room(room)
    if room not in rooms:
        rooms[room] = {'players': [], 'ready': {}, 'words': []}
    if username not in rooms[room]['players']:
        rooms[room]['players'].append(username)
    rooms[room]['ready'][username] = False
    emit('update_room', rooms[room], room=room)

@socketio.on('submit_words')
def on_submit_words(data):
    username = data['username']
    room = "23"
    rooms[room]['ready'][username] = True
    rooms[room]['words'].extend(data['words'])
    emit('update_ready', rooms[room]['ready'], room=room)
    if all(rooms[room]['ready'].values()):
        emit('start_countdown', room=room)

@socketio.on('start_game')
def on_start_game():
    room = "23"
    emit('display_hearts', {'words': rooms[room]['words']}, room=room)

@socketio.on('disconnect')
def on_disconnect():
    for room in rooms.values():
        for username in list(room['players']):
            if username in room['ready'] and room['ready'][username]:
                room['players'].remove(username)
                del room['ready'][username]
                emit('update_room', room, room="23")
                break

if __name__ == '__main__':
    socketio.run(app, debug=True)
