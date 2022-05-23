import json

import fileinput
import sys

import os

# goal: extract dictionary of { events: {id, date, title, filename}, edges: {type: string, sourceId, targetId} }
# assuming vis extra edges is no issue
# assuming events have unique ids

# key: string => Array<Array<text>>
extractedLinesByFile = {}
for filename in os.listdir(sys.argv[1]):
    with open(os.path.join(sys.argv[1], filename), 'r') as f:
        textLines = []

        for line in f:
            textLines.append(line)

        for i in range(len(textLines)):
            textLines[i] = textLines[i].strip()

        fileName = filename.split('/')[-1].split('.')[0]
        extractedLinesByFile[fileName] = textLines
    
allData = {'events': [], 'links': []}

# process lines into events and links
for key in extractedLinesByFile.keys():
    events = []
    links = []

    lines = extractedLinesByFile[key]

    i = 0 
    # extract all events for a source
    while i < len(lines):
        event = {}
        # event id
        index = len(allData["events"]) + len(events)
        event["id"] = index
        # event data
        event["date"] = lines[i]
        event["title"] = ''
        event["filename"] = key
        
        # add multiple lines of text together
        while i < len(lines) and lines[i + 1] != '--------------------------------':
            i += 1
            event["title"] = event["title"] + lines[i]
        i += 2
        event["title"] = event["title"].strip()
        events.append(event)

        if i < len(lines) - 1:
            link = { "type": 'before', "sourceId": index , "targetId": index + 1}
            links.append(link)
    allData["events"] = [*allData["events"], *events]
    allData["links"] = [*allData["links"], *links]

# print(allData["events"][0], allData["events"][-1])


# extract coreferent events
# dictArrays = []
# coreferentLinks = []
# for event in allData['events']:
#     cleanedEvent = event['title'].replace(' ', '')
#     arr = [0 for _ in range(127)]
#     for char in cleanedEvent:
#         if ord(char) < 127:
#             arr[ord(char)] += 1

#     def dictDiff(a1, a2):
#         counter = 0
#         for i in range(len(a1)):
#             counter += abs(a1[i] - a2[i])
#         return counter

#     for dictArray in dictArrays:
#         if dictDiff(arr, dictArray[1]) < (sum(dictArray[1]) + sum(arr)) * .11:
#             link = { "type": 'identity', "sourceId": event['id'] , "targetId": dictArray[0]}
#             coreferentLinks.append(link)
#             # create link
#     dictArrays.append([event['id'], arr])

eventsSeen = []
coreferentLinks = []
for event in allData['events']:
    for eventSeen in eventsSeen:
        if eventSeen['date'] == event['date']:
            link = { "type": 'identity', "sourceId": event['id'] , "targetId": eventSeen['id']}
            coreferentLinks.append(link)
            # create link
    eventsSeen.append(event)

allData['links'] = [*allData['links'], *coreferentLinks]

with open('./src/processed-timeline/' + sys.argv[1].split('/')[-1].split('.')[0] + '.json', 'w') as outfile:
    json.dump(json.dumps(allData), outfile)