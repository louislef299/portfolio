<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p class="byline">
	<time datetime={metadata.date}>{metadata.date}</time>
</p>

<content>
	<p>
		<a href="https://avro.apache.org/">Avro</a> is a language-neutral data serialization format.
		Basically if <a href="https://protobuf.dev/">protobuf</a> schema definitions were defined using
		JSON. Professionally, I was working with avro in a pretty complex streaming architecture, but I
		wanted to really understand how they worked on a smaller scale first. I'll assume you, the
		reader, will take the time to familiarize yourself with avro using the link above and are
		already familiar with Kafka.
	</p>

	<h2>Downloading Avro Tools</h2>

	<p>
		While it is easy to import avro into an existing project, it would be nice to mess around with
		plain avro schemas and then focus on integrating them into the project. You can download
		<a href="https://mvnrepository.com/artifact/org.apache.avro/avro-tools">avro-tools</a> from
		maven central by running:
	</p>

	<pre><code>mvn dependency:copy -Dartifact=org.apache.avro:avro-tools:1.12.0:jar -DoutputDirectory=./bin</code></pre>

	<p>You should be able to now view the available tools that come with it:</p>

	<pre><code>$ java -jar bin/avro-tools-1.12.0.jar
Version 1.12.0
 of Apache Avro
Copyright 2010-2015 The Apache Software Foundation

This product includes software developed at
The Apache Software Foundation (https://www.apache.org/).
----------------
Available tools:
    canonical  Converts an Avro Schema to its canonical form
          cat  Extracts samples from files
      compile  Generates Java code for the given schema.
       concat  Concatenates avro files without re-compressing.
        count  Counts the records in avro files or folders
  fingerprint  Returns the fingerprint for the schemas.
   fragtojson  Renders a binary-encoded Avro datum as JSON.
     fromjson  Reads JSON records and writes an Avro data file.
     fromtext  Imports a text file into an avro data file.
      getmeta  Prints out the metadata of an Avro data file.
    getschema  Prints out schema of an Avro data file.
          idl  Generates a JSON schema or protocol from an Avro IDL file
 idl2schemata  Extract JSON schemata of the types from an Avro IDL file
       induce  Induce schema/protocol from Java class/interface via reflection.
   jsontofrag  Renders a JSON-encoded Avro datum as binary.
       random  Creates a file with randomly generated instances of a schema.
      recodec  Alters the codec of a data file.
       repair  Recovers data from a corrupt Avro Data file
  rpcprotocol  Output the protocol of a RPC service
   rpcreceive  Opens an RPC Server and listens for one message.
      rpcsend  Sends a single RPC message.
       tether  Run a tethered mapreduce job.
       tojson  Dumps an Avro data file as JSON, record per line or pretty.
       totext  Converts an Avro data file to a text file.
     totrevni  Converts an Avro data file to a Trevni file.
  trevni_meta  Dumps a Trevni file's metadata as JSON.
trevni_random  Create a Trevni file filled with random instances of a schema.
trevni_tojson  Dumps a Trevni file as JSON.</code></pre>

	<p>
		Also make sure you use Java 11 for the tools. There were some security issues with later
		versions of Java that didn't play nice.
	</p>

	<h2>Defining our Schemas</h2>

	<p>
		For our example, we will define a schema of <code>User</code> where <code>id</code> and
		<code>name</code> fields are required, but <code>email</code> is optional and defaults to
		<code>null</code>:
	</p>

	<pre><code>{'{'}
    "namespace": "com.github.louislef299.events.avro",
    "type": "record",
    "name": "User",
    "fields": [
        {'{'}"name": "id", "type": "int"{'}'},
        {'{'}"name": "name", "type": "string"{'}'},
        {'{'}"name": "email", "type": ["null", "string"], "default": null{'}'}
    ]
{'}'}</code></pre>

	<p>
		With out <code>User</code> schema defined, let's create some records that adhere to the schema:
	</p>

	<pre><code>{'{'}"id":1,"name":"Louis","email":{'{'}"string":"louis@email.com"{'}'}{'}'}
{'{'}"id":2,"name":"Elise","email":null{'}'}</code></pre>

	<p>
		Assuming your avro schema is defined as <code>user.avsc</code> and your data is
		<code>users.json</code>, you would be able to serialize your data into JSON and retrieve the
		avro data from your new binary:
	</p>

	<pre><code>$ java -jar ./bin/avro-tools-1.12.0.jar fromjson \
    --schema-file user.avsc users.json &gt; user.avro
25/10/03 13:35:47 INFO tool.DataFileReadTool: Reading schema from file 'user.avsc'

$ java -jar ./bin/avro-tools-1.12.0.jar tojson user.avro
{'{'}"id":1,"name":"Louis","email":{'{'}"string":"louis@email.com"{'}'}{'}'}
{'{'}"id":2,"name":"Elise","email":null{'}'}</code></pre>

	<h3>A note on Magic Bytes</h3>

	<p>
		There's a great article on
		<a href="https://www.confluent.io/blog/how-to-fix-unknown-magic-byte-errors-in-apache-kafka/">magic bytes</a>
		from Confluent, but it's relatively common to come across this error:
	</p>

	<blockquote>
		<p>
			Caused by: org.apache.kafka.common.errors.SerializationException: Unknown magic byte!
		</p>
	</blockquote>

	<p>You can view the actual magic byte for avro by running:</p>

	<pre><code>$ xxd -l 32 user.avro
00000000: 4f62 6a01 0416 6176 726f 2e73 6368 656d  Obj...avro.schem
00000010: 619e 037b 2274 7970 6522 3a22 7265 636f  a..{'{'}"type":"reco

# 4F = 'O'
# 62 = 'b'
# 6A = 'j'
# 01 = Version byte</code></pre>

	<p>
		It is a way to identify the avro file type and when you see that error, it basically means
		there are differences in schema file formats on the producer and consumer ends.
	</p>

	<h2>Interacting with Schema Registry</h2>

	<p>
		<a href="https://docs.confluent.io/platform/current/schema-registry/index.html">Schema Registry</a>
		is a REST service that acts as a centralized repository for managing and validating schemas. In
		our use case, we can upload our avro schemas so that they can be shared between services(a
		producer and consumer). First, we need to spin up a local environment to begin interacting with
		schema registry. Since schema registry uses kafka as a backend, we also need to spin up a broker
		instance:
	</p>

	<pre><code>$ docker network create kafka-net

$ docker run -d --name kafka --network kafka-net -p 9092:9092 \
-e KAFKA_PROCESS_ROLES=broker,controller \
-e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT \
-e KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:29093 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 \
-e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
-e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:29093 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
-e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
-e KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1 \
-e CLUSTER_ID=MkU3OEVBNTcwNTJENDM2Qk \
-e KAFKA_NODE_ID=1 \
confluentinc/cp-kafka:8.0.0

$ docker run -d --name schema-registry --network kafka-net -p 8081:8081 \
-e SCHEMA_REGISTRY_HOST_NAME=schema-registry \
-e SCHEMA_REGISTRY_LISTENERS=http://0.0.0.0:8081 \
-e SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS=PLAINTEXT://kafka:9092 \
confluentinc/cp-schema-registry:8.0.0</code></pre>

	<p>
		Once the docker environment is up, you should be able to check the registry config, which in
		this case just prints out
		<a href="https://docs.confluent.io/platform/current/schema-registry/installation/config.html#schema-compatibility-level"><code>schema.compatibility.level</code></a>:
	</p>

	<pre><code>$ curl -i http://localhost:8081/config
HTTP/1.1 200 OK
Date: Mon, 06 Oct 2025 14:50:13 GMT
Vary: Accept-Encoding
X-Request-ID: 68139540-4aa1-4adf-9a0e-481545e1fe1e
Content-Type: application/vnd.schemaregistry.v1+json
Content-Length: 33

{'{'}"compatibilityLevel":"BACKWARD"{'}'}</code></pre>

	<h3>Create a New Schema</h3>

	<p>
		Funny enough, the process for creating a new schema requires interacting with the
		<code>/subjects</code> endpoint and not the <code>/schemas</code>. Subjects refer to the name
		of the registered schema across all contexts in the registry. To register our schema, we will be
		POSTing to <code>/subjects/(string: subject)/versions</code>, which will return the identifier
		that will be used to retrieve the schema later. The subject name we will target is
		<code>user-value</code>. More information on naming strategies are found on the
		<a href="https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/index.html#sr-schemas-subject-name-strategies-work">confluent subject names page</a>.
	</p>

	<pre><code>$ curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
--data '{'{'} "schema": "{'{'}\"namespace\":\"com.github.louislef299.events.avro\",\"type\":\"record\",\"name\":\"User\",\"fields\":[{'{'}\"name\":\"id\",\"type\":\"int\"{'}'},{'{'}\"name\":\"name\",\"type\":\"string\"{'}'},{'{'}\"name\":\"email\",\"type\":[\"null\",\"string\"],\"default\":null{'}'}]{'}'}" {'}'}' \
http://localhost:8081/subjects/user-value/versions
http://localhost:8081/subjects/user-value/versions
HTTP/1.1 200 OK
Date: Mon, 06 Oct 2025 15:23:50 GMT
Vary: Accept-Encoding
X-Request-ID: 2ec32d34-2831-4618-95ab-a9942e27ef11
Content-Type: application/vnd.schemaregistry.v1+json
Content-Length: 347

{'{'}"id":1,"version":1,"guid":"4bd2bf79-95af-aace-ebad-18dfd323a304","schemaType":"AVRO","schema":"{'{'}\"type\":\"record\",\"name\":\"User\",\"namespace\":\"com.github.louislef299.events.avro\",\"fields\":[{'{'}\"name\":\"id\",\"type\":\"int\"{'}'},{'{'}\"name\":\"name\",\"type\":\"string\"{'}'},{'{'}\"name\":\"email\",\"type\":[\"null\",\"string\"],\"default\":null{'}'}]{'}'}"{'}'}

# Verify the subject was created
$ curl http://localhost:8081/subjects
["user-value"]</code></pre>

	<p>
		And now that the <code>user-value</code> schema is registered in schema registry, they can be
		used by services like kafka to serialize/deserialize schema types. This is beyond the scope of
		this post, and maybe will be covered later. There are also more resources on confluent's page
		going over
		<a href="https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/serdes-avro.html">avro schema serializer and deserializer</a>
		specifically for the confluent platform.
	</p>

	<h2>Clean Up</h2>

	<p>
		Make sure to clean up docker resources when you are done messing with schema registry:
	</p>

	<pre><code>$ docker rm -f schema-registry kafka &amp;&amp; docker network rm kafka-net
schema-registry
kafka
kafka-net</code></pre>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
