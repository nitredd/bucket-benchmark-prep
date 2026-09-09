# bucket-benchmark-prep

Preparing data for benchmarking bucketed vs flat document structures.

## Usage

Run sampleDocs.js to create the collection with the flat document structure.

Set the MongoDB cluster URI in run_bkt.sh and use it to run mongosh with nohup - this script will take a while to execute and will write to db.finishedJobs when done.
