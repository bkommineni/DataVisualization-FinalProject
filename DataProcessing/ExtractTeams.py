import json

matches = open("./../data/matches.csv","r")

years_dict = dict()
year_team_dict = dict()
line_count = 0

for line in matches:
    if(line_count > 0):
        tokens = line.split(",")
        if tokens[1] in years_dict:
            years_dict[tokens[1]].append(tokens[0])
            teams = year_team_dict.get(tokens[1])
            if tokens[4] not in teams:
                year_team_dict[tokens[1]].append(tokens[4])
            if tokens[5] not in teams:
                year_team_dict[tokens[1]].append(tokens[5])
        else:
            years_dict[tokens[1]] = [tokens[0]]
            year_team_dict[tokens[1]] = [tokens[4],tokens[5]]
    line_count += 1

year_team_members = dict()

for year in years_dict.keys():
    matches = years_dict.get(year)
    teams_dict = dict()
    for line in open("./../data/deliveries.csv","r"):
        tokens = line.split(",")
        if tokens[0] in matches:
            if tokens[2] in teams_dict:
                mems = teams_dict[tokens[2]]
                if tokens[6] not in mems:
                    teams_dict[tokens[2]].append(tokens[6])
                if tokens[7] not in mems:
                    teams_dict[tokens[2]].append(tokens[7])
            else:
                teams_dict[tokens[2]] = [tokens[6],tokens[7]]

            if tokens[3] in teams_dict:
                mems = teams_dict[tokens[3]]
                if tokens[8] not in mems:
                    teams_dict[tokens[3]].append(tokens[8])
            else:
                teams_dict[tokens[3]] = [tokens[8]]
    year_team_members[year] = teams_dict

json = json.dumps(year_team_members)
f = open("./../data/teams_by_year.json","w")
f.write(json)
f.close()