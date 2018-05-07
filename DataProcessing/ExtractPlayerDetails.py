import json

matches = open("./../data/matches.csv","r")
deliveries = open("./../data/deliveries.csv","r")

players_dict = dict()
player_year_dict = dict()
line_count = 0
player_list = []
final_player_json = []
temp = []
year_list = []
for game in matches:
	row = game.split(",")
	year_list.append([row[0],row[1]])

match_id = 0
for line in deliveries:
    tokens = line.split(",")
    if tokens[17] != "total_runs":
        if tokens[16] == "0":
            player_list.append([tokens[0], tokens[6], 1, int(tokens[15])])

for point in player_list:
    match_id = point[0]
    balls_faced = 0
    runs_scored = 0
    if [point[0], point[1]] in temp:
        pass
    for player in player_list:
        if player[0] == match_id and player[1] == point[1]:
            batsman = player[1]
            balls_faced += int(player[2])
            runs_scored += int(player[3])
            for games in year_list:
                if match_id == games[0]:
                    year = games[1]
    row = [match_id, year, point[1], balls_faced, runs_scored]
    if row not in final_player_json:
        print(row)
        final_player_json.append(row)
        temp.append([point[0], point[1]])

json = json.dumps(final_player_json)
f = open("./../data/player_details.json","w")
f.write(json)
f.close()
