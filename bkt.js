function bucketAdd(aCompanyId, aUserId, aTs, aTitle, aEventLabel, aIsRemote) {
    db.bucket_calendar_events.updateOne({
        companyId: aCompanyId, userId: aUserId, cnt: {$lt: 100}
    }, {
        $push: {
            data: {
                ts: aTs,
                title: aTitle,
                eventLabels: aEventLabel,
                isRemote: aIsRemote
            }
        },
        $inc: {cnt: 1}
    }, {
        upsert: true,
        writeConcern: {w: 1}
    });
}

var bucketArr = [];

function bucketAdd2(aCompanyId, aUserId, aTs, aTitle, aEventLabel, aIsRemote) {
    bucketArr.append(
        {
            updateOne: {
                filter: {
                    companyId: aCompanyId, userId: aUserId, cnt: {$lt: 100}
                },
                update: {
                    $push: {
                        data: {
                            ts: aTs,
                            title: aTitle,
                            eventLabels: aEventLabel,
                            isRemote: aIsRemote
                        }
                    },
                    $inc: {cnt: 1}
                },
                upsert: true
            }
        }
    )
    if (bucketArr.length > 999) {
        db.bucket_calendar_events.bulkWrite(
            bucketArr,
            {
                writeConcern: {w: 1}
            }
        );
        bucketAdd = [];
    }
}

function flush() {
    if (bucketAdd == null || bucketAdd.length == 0) {
        return;
    }

    db.bucket_calendar_events.bulkWrite(
        bucketArr,
        {
            writeConcern: {w: 1}
        }
    );
    bucketAdd = [];
}

function loadData() {
    cleanup();
    createIdx();

    var cur = db.calendar_events.find({});
    while (cur.hasNext()) {
        obj = cur.next();
        bucketAdd2(obj.companyId, obj.userId, obj.ts, obj.title, obj.eventLabel, obj.isRemote);
    }

    flush()
    db.finishedJob({n: "loaded data into bucketed calendar events"})
}

function cleanup() {
    db.bucket_calendar_events.drop();
}

function createIdx() {
    db.bucket_calendar_events.createIndex({companyId: 1, userId: 1});
}

loadData()
