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
    Matrix = [[0 for x in range(len(teams))] for y in range(len(teams))]
    for i in range(0,len(teams)):
        for j in range(0,len(teams)):
            if i != j:
                line_count = 0
                matches = open("./../data/matches.csv", "r")
                for line in matches:
                    if (line_count > 0):
                        tokens = line.split(",")
                        if tokens[1] == year:
                            if ((teams[i] == tokens[4]) & (teams[j] == tokens[5])) | ((teams[i] == tokens[5]) & (teams[j] == tokens[4])):
                                if tokens[10] == teams[i]:
                                    Matrix[i][j] += 1

                    line_count += 1
    year_matrix_dict[year] = Matrix
json_wins = json.dumps(year_matrix_dict)
f = open('./../data/matrix_wins.json', "w")
f.write(json_wins)
f.close()




