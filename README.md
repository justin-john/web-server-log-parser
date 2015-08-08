Web server log file parser example in node.js
=============================================

A sample code for parsing server log file. This parser will parse each line in log file to extract following criteria

- The number of times the URL was called.
- The mean (average), median and mode of the response time (connect time + service time).
- The "dyno" that responded the most.

Sample parsed data of single URL

```
Endpoint: /api/users/{user_id}/count_pending_messages/
Count: 2430
Mean: 25
Median: 15
Mode: 11
Dyno: web.2
```

A sample web server log file and test log file with small set of entries is available in `test` directory
for unit testing is available in repository.

## To run the parser

```bash
$ node start.js
```

## To run unit testing

```bash
$ node test/test.js
```

### To Viewer

Please review and contact me with your suggestions or make your changes in repo with pull request.