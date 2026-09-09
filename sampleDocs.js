sampleDoc =
{
    companyId: 1,
    userId: 1,
    ts: ISODate(),
    title: "The great testing",
    eventLabels: ["busy", "outOfOffice", "unAvailable", "dndPhone", "dndEmail", "dndWhatsApp"],
    isRemote: true
}
;

var days = 90;

db.aggregate([
    {$documents: [
        sampleDoc
    ]},
    {
        $set: {
            offset: {
                $range: [0, 86400/3600 * days]
            }
        }
    },
    {
        $unwind: "$offset"
    },
    {
        $set: {
            ts: {
                $dateAdd: {
                    startDate: "$ts",
                    unit: "minute",
                    amount: "$offset"
                }
            }
        }
    },
    {
        $unset: "offset"
    },
    {
        $out: "tmp_calendar_events"
    }
]);

db.tmp_calendar_events.aggregate([
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
        $out: "calendar_events"
    }
]);
