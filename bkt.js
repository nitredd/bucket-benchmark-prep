function bucketAdd(aCompanyId, aUserId, aTs, aTitle, aEventLabels, aIsRemote) {
    db.bucket_calendar_events.updateOne({
        companyId: aCompanyId, userId: aUserId, cnt: {$lt: 100}
    }, {
        $push: {
            data: {
                ts: aTs,
                title: aTitle,
                eventLabels: aEventLabels,
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

function bucketAdd2(aCompanyId, aUserId, aTs, aTitle, aEventLabels, aIsRemote) {
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
                            eventLabels: aEventLabels,
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
        bucketArr = [];
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
    bucketArr = [];
}

function loadData() {
    cleanup();
    createIdx();

    var cur = db.calendar_events.find({});
    while (cur.hasNext()) {
        obj = cur.next();
        bucketAdd2(obj.companyId, obj.userId, obj.ts, obj.title, obj.eventLabels, obj.isRemote);
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
