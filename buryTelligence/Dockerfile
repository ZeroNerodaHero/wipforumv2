FROM python:3.7-slim
WORKDIR /root

#RUN apk update && \
#    apk add --no-cache python3 py3-pip build-base
#RUN pip install -U pip
RUN pip install -U pip

RUN pip install numpy pandas scikit-learn mysql-connector-python


COPY *.py /root
COPY source/ /root/source
COPY botScrape/* /root/botScrape/

#CMD ["python3", "/root/run.py"]
# docker run -it bury

COPY entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh

ENTRYPOINT ["/root/entrypoint.sh"]