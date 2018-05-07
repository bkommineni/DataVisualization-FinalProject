import json

matches = open("./../data/matches.csv","r")

line_count = 0
teams = []

for line in matches:
    if(line_count > 0):
        tokens = line.split(",")
        teams.append(tokens[4])
    line_count += 1

teams = sorted(list(set(teams)))

matches = open("./../data/matches.csv", "r")
line_count = 0
years = []

for line in matches:
    if (line_count > 0):
        tokens = line.split(",")
        years.append(tokens[1])
    line_count += 1

years = sorted(list(set(years)))




year_matrix_dict = dict()
for year in years:
    list_of_teams = []
    for i in range(0,len(teams)):
        stats_dict = dict()
        stats_dict["Team"] = teams[i]
        stats_dict["TotalWon"] = 0
        stats_dict["TotalLoss"] = 0
        stats_dict["TotalPlayed"] = 0
        stats_dict["NoResult"] = 0
        line_count = 0
        matches = open("./../data/matches.csv", "r")
        for line in matches:
            if (line_count > 0):
                tokens = line.split(",")
                if tokens[1] == year:
                    if (teams[i] == tokens[4]) | (teams[i] == tokens[5]):
                        if tokens[10] == teams[i]:
                            stats_dict["TotalWon"] += 1
                        elif tokens[10] != '':
                            stats_dict["TotalLoss"] += 1
                        else:
                            stats_dict["NoResult"] += 1
                        stats_dict["TotalPlayed"] += 1

            line_count += 1
        list_of_teams.append(stats_dict)
    year_matrix_dict[year] = list_of_teams

# print(year_matrix_dict)
json_wins = json.dumps(year_matrix_dict)
f = open('./../data/total_stats.json', "w")
f.write(json_wins)
f.close()