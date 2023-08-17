FROM python:3.7-slim
WORKDIR /root

#RUN apk update && \
#    apk add --no-cache python3 py3-pip build-base
#RUN pip install -U pip
RUN pip install -U pip

RUN pip install numpy pandas scikit-learn 


COPY run.py /root
COPY botScrape/* /root/botScrape/

CMD ["python3", "/root/run.py"]
# docker run -it bury