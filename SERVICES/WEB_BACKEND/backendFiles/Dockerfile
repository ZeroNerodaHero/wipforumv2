FROM alpine
USER root

RUN apk update && \
    apk add --no-cache openrc \
        apache2 \
        apache2-utils \
        php$phpverx-apache2 \
        php-mysqli \
        mysql-client \
        curl


EXPOSE 80/tcp
EXPOSE 80/udp

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV MYSQL_ROOT_PASSWORD password
ENV MYSQL_PWD password

WORKDIR /var/www/localhost/htdocs
RUN rm /var/www/localhost/htdocs/index*
COPY  index.php /var/www/localhost/htdocs 
COPY  login.php /var/www/localhost/htdocs 
COPY  SERVERCONFIG.php /var/www/localhost/htdocs 

RUN mkdir /var/www/localhost/htdocs/code
COPY code/ /var/www/localhost/htdocs/code/

#RUN mkdir /var/www/localhost/htdocs/imgs
RUN mkdir -p -v /var/www/localhost/htdocs/imgs/postImgs
RUN chmod -R 755 /var/www/localhost/htdocs/imgs && chown -R apache imgs/

CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]
VOLUME ["/var/www/localhost/htdocs/imgs"]

