import csv

with open('./../data/deliveries.csv','r') as g:
    reader2 = csv.reader(g)
    for row in reader2:
        row.append("season")
        with open('./../data/deliveries_with_year.csv', 'a') as h:
            writer = csv.writer(h)
            writer.writerows([row])
            break

with open('./../data/matches.csv', 'r') as f:
    next(f)
    reader = csv.reader(f)
    with open('./../data/deliveries.csv','r') as g:
        with open('./../data/deliveries_with_year.csv','a') as h:
            next(g)
            reader2 = csv.reader(g)
            writer = csv.writer(h)
            for row in reader:
                year=row[1]
                match=row[0]
                #print year,match
                for line in reader2:
                    match_id=line[0]
                    if match_id==match:
                        line.append(year)
                        writer.writerows([line])
                        print (line)
