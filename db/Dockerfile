FROM mysql:latest

EXPOSE 3306
ENV MYSQL_ROOT_USER root
ENV MYSQL_ROOT_PASSWORD root

ADD init.sql /docker-entrypoint-initdb.d
