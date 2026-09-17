
var days = 90;

dataTimes = 86400/3600 * days;
perBucket = 100;
remainingDataTimes = dataTimes;

while (remainingDataTimes > 0) {
    thisBucket = 1;
    sampleDoc =
    {
        companyId: 1,
        userId: 1,
        data: [{
            ts: ISODate(),
            title: "The great testing",
            eventLabels: ["busy", "outOfOffice", "unAvailable", "dndPhone", "dndEmail", "dndWhatsApp"],
            isRemote: true
        }]
    }
    ;

    anotherDoc = sampleDoc.data[0];
    while (thisBucket < 100 || remainingDataTimes > 0) {
        // TODO: Add a minute to ts
        sampleDoc.data.push(anotherDoc);
        thisBucket += 1;
        remainingDataTimes -= 1;
    }
    db.tmp_bucket_calendar_events.insertOne(sampleDoc);
}

db.tmp_bucket_calendar_events.aggregate([
    {
        $set: {
            userOffset: {
                $range: [0, 1000]
            }
        }
    },
    {
        $unwind: "$userOffset"
    },
    {
        $set: {
            companyOffset: {
                $range: [0, 100]
            }
        }
    },
    {
        $unwind: "$companyOffset"
    },
    {
        $set: {
            companyId: {
                $add: ["$companyId", "$companyOffset"]
            }
        }
    },
    {
        $unset: ["userOffset", "companyOffset", "_id"]
    },
    {
        $out: "bucket_calendar_events"
    }
])