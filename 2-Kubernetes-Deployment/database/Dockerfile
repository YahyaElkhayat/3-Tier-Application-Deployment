FROM mysql:latest

VOLUME /var/lib/mysql 

USER mysql

ENV  MYSQL_DATABASE=school
ENV  MYSQL_USER=school_user
ENV  MYSQL_PASSWORD=password123


EXPOSE 3306

CMD ["mysqld"]